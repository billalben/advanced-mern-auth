import { ZodError } from "zod";

export interface FormattedZodIssue {
  path: string;
  message: string;
}

export const formatZodError = (err: ZodError): FormattedZodIssue[] => {
  return err.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));
};
