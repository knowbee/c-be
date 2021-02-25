import db from "../database/index";
import jwt from "jsonwebtoken";
import winston from "winston";
import "dotenv/config";

import {
  FORBIDDEN,
  UNAUTHORIZED,
  SERVER_ERROR,
} from "../constants/statusCodes";
import { jsonResponse } from "../utils";

const decodeToken = async (token) => {
  const data = jwt.verify(token, process.env.SECRET_KEY);
  return data;
};

const loggedInUser = async (req, res) => {
  let token = req.headers.authorization;
  try {
    if (!token) {
      jsonResponse(res, UNAUTHORIZED, "Token is missing", null);
      return;
    }
    const decodedToken = await decodeToken(token);
    if (decodedToken) {
      const result = await db.query('SELECT * FROM users WHERE "email"=$1', [
        decodedToken.email,
      ]);

      const user = result.rows[0];
      if (!user) {
        return jsonResponse(res, FORBIDDEN, "You are not authenticated", null);
      }
      return decodedToken;
    }
    return jsonResponse(
      res,
      SERVER_ERROR,
      "You are not logged in, login first!!!",
      null
    );
  } catch (error) {
    return jsonResponse(res, SERVER_ERROR, "Invalid token", null);
  }
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

//
// If not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;

export { decodeToken, loggedInUser, logger };
