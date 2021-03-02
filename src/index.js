#!/usr/bin/env node
import dotenv from "dotenv";
import AuthController from "./controllers/auth.controller";
import UserController from "./controllers/user.controller";
import MessagesController from "./controllers/messages.controller";
import App from "./lib";
import cors from "cors";
import socketIo from "./sockets/socketio";
import bodyParser from "body-parser";
import ErrorResponse from "./middlewares";
import morgan from "morgan";
dotenv.config();

let server;

let app = new App();

// Enable cors
app.use(cors());

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// logging middleware
app.use(morgan("tiny"));

app.get("/", (req, res, next) => {
  res.end(
    JSON.stringify({
      message: "Welcome",
    })
  );
});
app.post("/auth/register", (req, res, next) => {
  AuthController.register(req, res);
});

app.post("/auth/login", (req, res, next) => {
  AuthController.login(req, res);
});

app.get("/users", (req, res, next) => {
  UserController.getAllUsers(req, res);
});

app.get("/messages", (req, res, next) => {
  MessagesController.getAllMessages(req, res);
});

app.post("/messages", (req, res, next) => {
  MessagesController.sendMessage(req, res);
});

app.use(ErrorResponse());

const hostname = "0.0.0.0";

const port = process.env.PORT || 5000;
try {
  server = app.listen(port, hostname);
  socketIo(server);
  console.log("app listening on port " + port);
} catch (error) {}

export { server };
