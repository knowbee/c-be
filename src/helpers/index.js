/**
 *
 * @param {*} res
 * @param {Number} status
 * @param {String} message
 * @param {any} data
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
  return;
};

export { jsonResponse };
