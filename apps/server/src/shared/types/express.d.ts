import type { AuthedRequestBody } from "../../modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      validated?: AuthedRequestBody;
    }
  }
}

export {};
