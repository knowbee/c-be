/**
 *@author Igwaneza
 * @author Bruce
 * @param {Object} req
 */

async function bodyParser(req) {
  return new Promise((resolve, reject) => {
    let totalChunked = "";
    req
      .on("error", (err) => {
        console.error(err);
        reject();
      })
      .on("data", (chunk) => {
        totalChunked += chunk;
      })
      .on("end", () => {
        req.body = JSON.parse(totalChunked);
        resolve();
      });
  });
}

async function dbActions(pool, tableAction) {
  pool
    .query(tableAction)
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
}
/**
 *@author Igwaneza
 * @author Bruce
 * @param {Object} res
 * @param {Number} status
 * @param {String} message
 * @param {*} data
 */

const jsonResponse = (res, status, message, data) => {
  res.statusCode = status;
  res.setHeader("content-Type", "Application/json");
  res.end(
    JSON.stringify({
      message,
      data,
    })
  );
};

export { bodyParser, jsonResponse, dbActions };
