import db from "../database/index";
import { bodyParser, jsonResponse } from "../utils";
import {
  BAD_REQUEST,
  CREATED,
  OK,
  UNAUTHORIZED,
} from "../constants/statusCodes";
import { loggedInUser, decodeToken } from "../helpers";

/**
 * @description Chats class
 */
export default class ChatsController {
  /**
   * @author Igwaneza
   * @author Bruce
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Returns the response
   */
  static async getAllUserChats(req, res) {
    const user = await loggedInUser(req, res);
    if (user) {
      const query = "SELECT * FROM chats WHERE created_by=$1 OR participant=$1";
      const values = [user.id];
      db.query(query, values).then((result) => {
        jsonResponse(res, OK, "Chats retrieved", result.rows);
      });
    } else {
      jsonResponse(res, UNAUTHORIZED, "You are not authorized", null);
    }
  }

  /**
   * @author Igwaneza
   * @author Bruce
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Returns the response
   */
  static async createChat(req, res, body) {
    try {
      let token = req.headers.authorization;
      let user;
      user = await decodeToken(token);

      if (user && user.id == body.user_id) {
        const data = {
          created_by: body.user_id,
          participant: body.participant,
          title: body.title,
        };
        const query =
          "INSERT INTO chats(title, created_by, participant) VALUES($1,$2,$3) returning id, title, created_by, participant";
        const values = [data.title, data.created_by, data.participant];

        const { rows } = await db.query(query, values);
        jsonResponse(res, CREATED, "Created chat", rows[0]);
      } else {
        jsonResponse(res, BAD_REQUEST, "Failed to create chat", null);
      }
    } catch (error) {
      jsonResponse(res, UNAUTHORIZED, "You are not authorized", null);
    }
  }
}
