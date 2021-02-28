import "dotenv/config";

module.exports = {
  dev: {
    url: process.env.DATABASE_URL_DEV,
  },
  test: {
    url: process.env.DATABASE_URL_TEST,
  },
  production: {
    url: process.env.DATABASE_URL_PROD,
  },
};
