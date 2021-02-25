import { OK, UNAUTHORIZED } from "../constants/statusCodes";
import db from "../database/index";
import { loggedInUser } from "../helpers";
import { jsonResponse } from "../utils";
/**
 * @description User class
 */
export default class UserController {
  /**
   * @author Igwaneza
   * @author Bruce
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Returns the response
   */
  static async getAllUsers(req, res) {
    const user = await loggedInUser(req, res);
    if (user) {
      const query = "SELECT id, name, email, joined_at FROM users";
      db.query(query).then((result) => {
        jsonResponse(res, OK, "Users retrieved", result.rows);
        return;
      });
    } else {
      jsonResponse(res, UNAUTHORIZED, "You are not authorized", null);
      return;
    }
  }
}
