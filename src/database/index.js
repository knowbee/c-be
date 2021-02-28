import "dotenv/config";
import pg from "pg";

const env = process.env.NODE_ENV || "dev";
const configDb = require("./config")[env];
const url = configDb.url || process.env.DATABASE_CONNECTION_URL;

const config = {
  connectionString: url,
  max: 10,
  idleTimeoutMillis: 30000,
};
const pool = new pg.Pool({
  connectionString: url,
});

pool.on("connect", () => {
  console.log("connected to the Database");
});

export default {
  query(text, params) {
    return new Promise((resolve, reject) => {
      pool
        .query(text, params)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
