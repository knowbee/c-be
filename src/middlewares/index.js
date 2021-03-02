import { BAD_REQUEST } from "../constants/statusCodes";
import endpoints from "../constants/endpoints";
const ErrorResponse = () => (req, res, next) => {
  res.statusCode = BAD_REQUEST;
  return res.end(
    JSON.stringify({
      status: BAD_REQUEST,
      message: "Available endpoints",
      endpoints,
    })
  );
};

export default ErrorResponse;
