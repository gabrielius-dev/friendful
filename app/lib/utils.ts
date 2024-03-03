import { Prisma } from "@prisma/client/edge";
import { z } from "zod";
import prisma from "./prisma";
import imageCompression from "browser-image-compression";

export function formatZodErrors(errors: z.ZodError): Record<string, string[]> {
  const errorObject: Record<string, string[]> = {};

  errors.issues.forEach((error) => {
    const [key] = error.path; // Get the first element of the path array
    const message = [error.message];
    errorObject[key] = message;
  });

  return errorObject;
}

const findSpecificUser = (email: string) => {
  return Prisma.validator<Prisma.UserWhereInput>()({
    email,
  });
};

export async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: findSpecificUser(email),
    });
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user.");
  }
}

export async function getAuthUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      },
    });
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user.");
  }
}

export const compressImage = async (image: File) => {
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  const compressedFile = await imageCompression(image, options);
  return compressedFile;
};

export function getRandomAvatarColor() {
  const backgroundColors = [
    "#3498db", // Blue
    "#2ecc71", // Green
    "#f39c12", // Orange
    "#9b59b6", // Purple
    "#1abc9c", // Turquoise
    "#16a085", // Green Sea
    "#2980b9", // Belize Hole
  ];
  const randomColor =
    backgroundColors[Math.floor(Math.random() * backgroundColors.length)];

  return randomColor;
}
