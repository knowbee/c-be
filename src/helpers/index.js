import db from "../database/index";
import jwt from "jsonwebtoken";
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

export { decodeToken, loggedInUser };
