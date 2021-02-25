import db from "../database/index";
import { bodyParser, decodeToken, jsonResponse, loggedInUser } from "../utils";

import { CREATED, OK, UNAUTHORIZED } from "../constants/statusCodes";

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
    const loggedInUser = await loggedInUser(req, res);
    if (loggedInUser) {
      const query = "SELECT * FROM chats";
      db.query(query).then((result) => {
        jsonResponse(res, OK, "Chats retrieved", result.rows);
      });
    } else {
      jsonResponse(res, UNAUTHORIZED, "You are not authorized", null);
    }
  }
}
