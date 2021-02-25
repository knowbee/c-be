import "dotenv/config";
import pg from "pg";

const { NODE_ENV } = process.env;
const env =
  NODE_ENV === "test" || NODE_ENV === "dev" ? `${NODE_ENV}`.toUpperCase() : "";

const config = {
  connectionString: process.env[`DATABASE_URL_${env}`],
  max: 10,
  idleTimeoutMillis: 30000,
};

const pool = new pg.Pool(config);

pool.on("connect", () => {
  console.log("connected");
});

const dropTables = () => {
  const usersTable = "DROP TABLE IF EXISTS users";
  const dropTablesQuery = `${usersTable};`;

  pool
    .query(dropTablesQuery)
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
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;
  const createTablesQuery = `${usersTable};`;

  pool
    .query(createTablesQuery)
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
