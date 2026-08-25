import { MailtrapClient } from "mailtrap";
import { env } from "../../../config/env";

export const mailtrapClient = new MailtrapClient({
  token: env.MAILTRAP_TOKEN ?? "",
  sandbox: true,
});

export const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Billal Benzazoua",
};
