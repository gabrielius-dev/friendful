"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { CustomAuthError, InitialErrors } from "./types";
import prisma from "./prisma";
import { AuthSchema } from "./schemas";
import { Prisma } from "@prisma/client/edge";
import bcrypt from "bcryptjs";

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

export async function signUp(prevState: InitialErrors, formData: FormData) {
  const validatedFields = AuthSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return validatedFields.error.flatten().fieldErrors;
  }

  const { fullName, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    //Add user to database
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
      },
    });

    formData.append("redirectTo", "/");
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2022: Unique constraint failed
      // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
      if (error.code === "P2002") {
        return {
          email: ["Email already exists"],
        };
      }
    } else if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials";
        case "CallbackRouteError":
          if (error.cause?.err instanceof CustomAuthError) {
            return error.cause?.err.data;
          }
        default:
          return "Something went wrong. Try again later!";
      }
    }
    throw error;
  }
}
