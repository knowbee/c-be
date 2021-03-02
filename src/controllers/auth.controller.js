import { CREATED, OK, SERVER_ERROR } from "../constants/statusCodes";
import bcrypt from "bcryptjs";
import db from "../database/index";
import jwt from "jsonwebtoken";
import { bodyParser, jsonResponse } from "../utils";

/**
 * @description Authentication class
 */
export default class AuthController {
  /**
   * @author Igwaneza
   * @author Bruce
   * @param {Object} req
   * @param {Object} res
   * @param {Object} body
   * @returns {Object} Returns the response
   */
  static async register(req, res) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const data = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    };
    const query =
      "INSERT INTO users(name, email, password) VALUES($1,$2,$3) returning id, name, email";
    const values = [data.name, data.email, data.password];

    let userExist = "";
    userExist = await db.query('SELECT * FROM users WHERE "email"=$1', [
      data.email,
    ]);
    if (userExist.rows.length > 0) {
      jsonResponse(
        res,
        SERVER_ERROR,
        "Sorry, User with this email already exists",
        null
      );
    }
    const { rows } = await db.query(query, values);
    jsonResponse(res, CREATED, "Created user", rows[0]);
  }

  /**
   * @author Igwaneza
   * @author Bruce
   * @param {Object} req
   * @param {Object} res
   * @param {Object} body
   * @returns {Object} Returns the response
   */
  static async login(req, res) {
    let user;
    if (req.body.email !== "" && req.body.password !== "") {
      const userExists = await db.query(
        'SELECT * FROM users WHERE "email"=$1',
        [req.body.email]
      );

      if (userExists.rows.length > 0) {
        for (let i = 0; i < userExists.rows.length; i += 1) {
          if (
            bcrypt.compareSync(req.body.password, userExists.rows[i].password)
          ) {
            user = {
              id: userExists.rows[i].id,
              name: userExists.rows[i].name,
              email: userExists.rows[i].email,
            };

            jwt.sign(
              user,
              process.env.SECRET_KEY,
              { expiresIn: "7d" },
              (err, token) => {
                const payload = {
                  message: "User successfully logged in",
                  user,
                  token,
                };
                return jsonResponse(res, OK, null, payload);
              }
            );
          } else {
            return jsonResponse(res, SERVER_ERROR, "Invalid credentials", null);
          }
        }
      }
      return;
    } else {
      jsonResponse(
        res,
        SERVER_ERROR,
        "Please, enter your email and your password!",
        null
      );
      return;
    }
  }
}
