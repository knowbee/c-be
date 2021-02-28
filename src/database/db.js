import "dotenv/config";
import pg from "pg";
import { dbActions } from "../utils";

const env = process.env.NODE_ENV || "dev";
const configDb = require("./config")[env];
const url = configDb.url || process.env.DATABASE_CONNECTION_URL;

const config = {
  connectionString: url,
  max: 10,
  idleTimeoutMillis: 30000,
};

const pool = new pg.Pool(config);

pool.on("connect", () => {
  console.log("connected to the Database");
});

const dropTables = async () => {
  const messagesTable = "DROP TABLE IF EXISTS messages";

  const usersTable = "DROP TABLE IF EXISTS users";

  const dropTablesQueries = `${messagesTable}; ${usersTable};`;

  await dbActions(pool, dropTablesQueries);
};
const createTables = async () => {
  const usersTable = `CREATE TABLE IF NOT EXISTS
      users(
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;
  const messagesTable = `CREATE TABLE IF NOT EXISTS
      messages(
      id SERIAL PRIMARY KEY,
      unread BOOLEAN NOT NULL DEFAULT true,
      message TEXT NOT NULL,
      sender_id INTEGER NOT NULL REFERENCES users (id),
      receiver_id INTEGER NOT NULL REFERENCES users (id),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`;
  const createTablesQueries = `${usersTable}; ${messagesTable}`;

  await dbActions(pool, createTablesQueries);
};

export { dropTables, createTables, pool };

require("make-runnable");
