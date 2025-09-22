import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: undefined,
  redact: {
    paths: ["req.headers.authorization", "headers.authorization", "password", "token"],
    remove: true
  }
});


