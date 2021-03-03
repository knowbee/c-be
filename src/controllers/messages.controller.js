import db from "../database/index";
import {
  OK,
  UNAUTHORIZED,
  BAD_REQUEST,
  CREATED,
} from "../constants/statusCodes";
import { jsonResponse } from "../utils";
import { loggedInUser } from "../helpers";
import eventEmitter from "../sockets/eventEmitter";
export default class MessagesController {
  /**
   * @author Igwaneza
   * @author Bruce
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Returns the response
   */

  static async getAllMessages(req, res) {
    const user = await loggedInUser(req, res);
    if (user) {
      const query = `
      SELECT  messages.*, 
        a.name,
        b.name
      FROM  messages     
        INNER JOIN users a
            ON messages.sender_id = a.id
        INNER JOIN users b
            ON messages.receiver_id = b.id
      WHERE messages.sender_id = ${user.id} OR  messages.receiver_id = ${user.id}
      ORDER BY id DESC
      `;
      db.query(query).then((result) => {
        jsonResponse(res, OK, "Messages retrieved", result.rows);
        return;
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
   * @param {Object} body
   * @returns {Object} Returns the response
   */
  static async sendMessage(req, res) {
    const { receiver_id, message, sender_id } = req.body;
    const user = await loggedInUser(req, res);
    if ((receiver_id, message, sender_id)) {
      if (user.id == sender_id) {
        const query = `INSERT INTO messages(receiver_id, message, sender_id) VALUES($1,$2,$3) returning id, receiver_id, message, sender_id`;
        const values = [receiver_id, message, sender_id];
        const { rows } = await db.query(query, values);
        eventEmitter.emit("messageSent", rows[0]);
        jsonResponse(res, CREATED, "Messages sent", rows[0]);
      } else {
        jsonResponse(res, UNAUTHORIZED, "You are not authorized", null);
      }
    } else {
      jsonResponse(res, BAD_REQUEST, "Message must not be empty", null);
    }
  }
}
