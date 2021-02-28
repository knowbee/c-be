#!/usr/bin/env node
import dotenv from "dotenv";
import AuthController from "./controllers/auth.controller";
import UserController from "./controllers/user.controller";
import MessagesController from "./controllers/messages.controller";
import API from "./lib";
import cors from "cors";
import { logger } from "./helpers";
dotenv.config();

let server;

let app = new API();

// Enable cors
app.use(cors());

app.get("/", (req, res, next) => {
  res.setHeader("content-Type", "Application/json");
  res.end(
    JSON.stringify({
      message: "Welcome",
    })
  );
});
app.post("/auth/register", (req, res, next) => {
  let body = "";
  req
    .on("data", (chunk) => {
      body += chunk;
    })
    .on("end", () => {
      if (body) {
        body = JSON.parse(body);
        AuthController.register(req, res, body);
      }
    });
});

app.post("/auth/login", (req, res, next) => {
  let body = "";
  req
    .on("data", (chunk) => {
      body += chunk;
    })
    .on("end", () => {
      if (body) {
        body = JSON.parse(body);
        AuthController.login(req, res, body);
      }
    });
});

app.get("/users", (req, res, next) => {
  UserController.getAllUsers(req, res);
});

app.get("/messages", (req, res, next) => {
  MessagesController.getAllMessages(req, res);
});

app.post("/messages", (req, res, next) => {
  let body = "";
  req
    .on("data", (chunk) => {
      body += chunk;
    })
    .on("end", () => {
      if (body) {
        body = JSON.parse(body);
        MessagesController.sendMessage(req, res, body);
      }
    });
});

const port = process.env.PORT;
try {
  server = app.listen(5000);
  logger.info("app listening on port " + port);
} catch (error) {}

export { server };
