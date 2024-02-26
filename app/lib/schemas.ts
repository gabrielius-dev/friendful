import { z } from "zod";

export const AuthSchema = z.object({
  fullName: z
    .string({ required_error: "Full name must be specified" })
    .max(100)
    .optional(),
  email: z
    .string({ required_error: "Email must be specified" })
    .email("Invalid email")
    .max(100),
  password: z
    .string({ required_error: "Password must be specified" })
    .min(8)
    .max(100),
});
