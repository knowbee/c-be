import db from "../database/index";
import {
  OK,
  NOT_FOUND,
  UNAUTHORIZED,
  SERVER_ERROR,
  BAD_REQUEST,
  CREATED,
} from "../constants/statusCodes";
import { bodyParser, jsonResponse } from "../utils";
import { loggedInUser } from "../helpers";

export default class MessagesController {
  static async getAllChatMessages(req, res) {
    const { chat_id } = req.headers;
    const user = await loggedInUser(req, res);
    if (user) {
      try {
        const query = `SELECT * FROM chats WHERE id=$1`;
        const values = [chat_id];
        const { rows } = await db.query(query, values);
        if (rows[0].title) {
          const query = `SELECT * FROM messages WHERE chat_id=$1`;
          const values = [rows[0].id];
          db.query(query, values).then((result) => {
            jsonResponse(res, OK, "Messages retrieved", result.rows);
            return;
          });
        }
      } catch (error) {
        jsonResponse(res, NOT_FOUND, "Chat does not exist", null);
        return;
      }
    } else {
      jsonResponse(res, UNAUTHORIZED, "You are not authorized", null);
    }
  }

  static async sendMessage(req, res) {
    await bodyParser(req);
    const { chat_id, message, user_id } = req.body;
    const user = await loggedInUser(req, res);
    if ((chat_id, message, user_id)) {
      try {
        if (user.id == req.body.user_id) {
          const query = `INSERT INTO messages(chat_id, message, user_id) VALUES($1,$2,$3) returning id, chat_id, message, user_id`;
          const values = [chat_id, message, user_id];
          const { rows } = await db.query(query, values);
          jsonResponse(res, CREATED, "Messages sent", rows[0]);
        } else {
          jsonResponse(res, UNAUTHORIZED, "You are not authorized", null);
        }
      } catch (error) {
        jsonResponse(res, SERVER_ERROR, "Failed to send a message", null);
      }
    } else {
      jsonResponse(res, BAD_REQUEST, "Message must not be empty", null);
    }
  }
}
