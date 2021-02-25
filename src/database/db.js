import "dotenv/config";
import pg from "pg";

const { NODE_ENV } = process.env;
const env =
  NODE_ENV === "test" || NODE_ENV === "dev" ? `_${NODE_ENV}`.toUpperCase() : "";

const config = {
  connectionString: process.env[`DATABASE_URL${env}`],
  max: 10,
  idleTimeoutMillis: 30000,
};

const pool = new pg.Pool(config);

pool.on("connect", () => {
  console.log("connected to the Database");
});

const dropTables = () => {
  const chatsTable = "DROP TABLE IF EXISTS chats";

  const usersTable = "DROP TABLE IF EXISTS users";

  const dropTablesQueries = `${chatsTable}; ${usersTable};`;

  pool
    .query(dropTablesQueries)
    .then((res) => {
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
  pool.on("remove", () => {
    console.log("client removed");
    process.exit(0);
  });
};
const createTables = () => {
  const usersTable = `CREATE TABLE IF NOT EXISTS
      users(
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

  const chatsTable = `CREATE TABLE IF NOT EXISTS
      chats(
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users (id),
        participant INTEGER NOT NULL REFERENCES users (id),
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;
  const createTablesQueries = `${usersTable}; ${chatsTable}`;

  pool
    .query(createTablesQueries)
    .then((res) => {
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
  pool.on("remove", () => {
    console.log("client removed");
    process.exit(0);
  });
};

export { dropTables, createTables, pool };

require("make-runnable");
