#!/usr/bin/env node
import dotenv from "dotenv";
import server from "./routes";
import { logger } from "./helpers";

dotenv.config();

const hostname = "0.0.0.0";

const port = process.env.PORT || 5000;

server.listen(port, hostname, () => {
  logger.info(`Server running at http://${hostname}:${port}/`);
});

export default server;
