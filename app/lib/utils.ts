import { z } from "zod";

export function formatZodErrors(errors: z.ZodError): Record<string, string[]> {
  const errorObject: Record<string, string[]> = {};

  errors.issues.forEach((error) => {
    const [key] = error.path; // Get the first element of the path array
    const message = [error.message];
    errorObject[key] = message;
  });

  return errorObject;
}
