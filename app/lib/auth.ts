import { auth } from "@/auth";
import prisma from "./prisma";

export const currentUser = async () => {
  const session = (await auth())!;

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id },
  });

  return user;
};
