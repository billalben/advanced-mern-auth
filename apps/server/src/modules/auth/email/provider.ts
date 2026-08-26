import { env } from "../../../config/env";
import { ResendProvider } from "./resend.provider";
import type { EmailProvider } from "./types";

export const emailProvider: EmailProvider =
  env.EMAIL_PROVIDER === "resend"
    ? new ResendProvider()
    : (() => {
        throw new Error(`Unsupported EMAIL_PROVIDER: ${env.EMAIL_PROVIDER}`);
      })();
