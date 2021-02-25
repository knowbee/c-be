import http from "http";
import url from "url";
import { OK } from "../constants/statusCodes";
import { jsonResponse } from "../helpers";

export default http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);

  if (reqUrl.pathname == "/" && req.method === "GET") {
    return jsonResponse(res, OK, "Welcome", null);
  }
});
