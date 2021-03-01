import http from "http";
import pathToRegexp from "path-to-regexp";
class MiddlewarePipeline {
  constructor() {
    this._stack = [];
  }

  use(url, middleware) {
    if (arguments.length === 1) {
      middleware = url;
      url = null;
    }
    if (typeof middleware !== "function") {
      throw new Error("Middleware must be a function!");
    }
    this._stack.push(new Layer(null, url, middleware, { end: false }));
  }

  route(method, url, handler) {
    this._stack.push(new Layer(method, url, handler));
    return this;
  }

  get(url, handler) {
    return this.route("GET", url, handler);
  }
  post(url, handler) {
    return this.route("POST", url, handler);
  }

  handle(req, res, callback) {
    let idx = 0;

    const next = (err) => {
      // If an error occurred, bypass the rest of the pipeline.
      if (err != null) {
        return setImmediate(() => callback(err));
      }
      if (idx >= this._stack.length) {
        return setImmediate(() => callback());
      }

      let layer = this._stack[idx++];
      // Find the next layer that matches
      while (idx <= this._stack.length && !layer.match(req.method, req.url)) {
        layer = this._stack[idx++];
      }
      // If no more layers, we're done.
      if (layer == null) {
        return setImmediate(() => callback());
      }

      // Decorate `req` with the layer's `params`. Make sure to do it
      // **outside** `setImmediate()` because of concurrency concerns.
      req.params = Object.assign({}, layer.params);

      const originalUrl = req.url;
      req.path = layer.path;
      req.url = req.url.substr(req.path.length);

      try {
        // Switch to using `setImmediate()` in the callback, because `req.url`
        // needs to be reset synchronously before calling `next()`
        const retVal = layer.middleware(req, res, (err) => {
          setImmediate(() => next(err));
        });
        req.url = originalUrl;
        if (retVal instanceof Promise) {
          retVal.catch((error) => next(error));
        }
      } catch (error) {
        req.url = originalUrl;
        next(error);
      }
    };

    next();
  }
}
class Layer {
  constructor(method, url, middleware, opts) {
    this.method = method;
    this.path = "";
    if (url != null) {
      this.keys = [];
      this.url = pathToRegexp(url, this.keys, opts);
    }
    this.middleware = middleware;
  }

  match(method, url) {
    // Matching method is easy: if specified, check to see if it matches
    if (this.method != null && this.method !== method) {
      return false;
    }
    // Matching URL is harder: need to check if the regexp matches, and
    // then pull out the URL params.
    if (this.url != null) {
      const match = this.url.exec(url);
      // If the URL doesn't match, this layer doesn't match
      if (match == null) {
        return false;
      }
      // Store the part of the URL that matched, so `this.path` will
      this.path = match[0];

      // Copy over params
      this.params = {};
      for (let i = 1; i < match.length; ++i) {
        // First element of the `match` array is always the part of the URL
        // that matched.
        this.params[this.keys[i - 1].name] = decodeURIComponent(match[i]);
      }
    }

    return true;
  }
}

class API extends MiddlewarePipeline {
  listen(port, host, callback) {
    const handler = (req, res) => {
      this.handle(req, res, (err) => {
        if (err) {
          res.writeHead(500);
          res.end("Internal Server Error");
        }
      });
    };
    return http.createServer(handler).listen({ host, port }, callback);
  }
}
module.exports = API;
