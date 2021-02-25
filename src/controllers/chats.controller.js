import db from "../database/index";
import { bodyParser, jsonResponse } from "../utils";
import { CREATED, OK, UNAUTHORIZED } from "../constants/statusCodes";
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
  static async createChat(req, res) {
    await bodyParser(req);
    try {
      let token = req.headers.authorization;
      let user;
      user = await decodeToken(token);

      if (user && user.id == req.body.user_id) {
        const data = {
          created_by: req.body.user_id,
          participant: req.body.participant,
          title: req.body.title,
        };
        const query =
          "INSERT INTO chats(title, created_by, participant) VALUES($1,$2,$3) returning title, created_by, participant";
        const values = [data.title, data.created_by, data.participant];

        const { rows } = await db.query(query, values);
        jsonResponse(res, CREATED, "Created chat", rows[0]);
      } else {
        jsonResponse(res, UNAUTHORIZED, "Token expired", null);
      }
    } catch (error) {
      jsonResponse(res, UNAUTHORIZED, "You are not authorized", null);
    }
  }
}
