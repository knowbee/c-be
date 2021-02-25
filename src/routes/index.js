import http from "http";
import url from "url";
import { OK } from "../constants/statusCodes";
import AuthController from "../controllers/auth.controller";
import UserController from "../controllers/user.controller";
import { jsonResponse } from "../utils";

export default http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);

  if (reqUrl.pathname == "/" && req.method === "GET") {
    return jsonResponse(res, OK, "Welcome", null);
  }

  // endpoint to register a new user
  else if (reqUrl.pathname == "/auth/register" && req.method === "POST") {
    AuthController.register(req, res);
  }
  // endpoint to login a user
  else if (reqUrl.pathname == "/auth/login" && req.method === "POST") {
    AuthController.login(req, res);
  }

  // endpoint to register a new user
  else if (reqUrl.pathname == "/users" && req.method === "GET") {
    UserController.getAllUsers(req, res);
  }
});
