import { CronJob } from "cron";
import https from "node:https";
import { logger } from "./logger";

export const createPingJob = (url: string): CronJob => {
  return new CronJob("*/12 * * * *", () => {
    https
      .get(url, (res) => {
        if (res.statusCode === 200) {
          logger.debug("GET request sent successfully");
        } else {
          logger.warn(
            { statusCode: res.statusCode },
            "GET request failed",
          );
        }
      })
      .on("error", (e) => {
        logger.error({ err: e }, "Error while sending request");
      });
  });
};
