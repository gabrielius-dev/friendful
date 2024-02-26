"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { CustomAuthError, InitialErrors } from "./types";

export async function authenticate(
  prevState: InitialErrors,
  formData: FormData
) {
  try {
    formData.append("redirectTo", "/");
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials";
        case "CallbackRouteError":
          if (error.cause?.err instanceof CustomAuthError) {
            return error.cause?.err.data;
          }
        default:
          return "Something went wrong";
      }
    }
    throw error;
  }
}
