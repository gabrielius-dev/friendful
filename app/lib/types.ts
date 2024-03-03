import { Post as PostType, User as UserType } from "@prisma/client";

export type InitialErrors =
  | { email?: string[]; password?: string[]; fullName?: string[] }
  | string
  | undefined;

export class CustomAuthError extends Error {
  constructor(public data: InitialErrors, message?: string) {
    super(message);
    this.name = "CustomAuthError";
  }
}

export type PostWithAuthor = PostType & {
  author: UserType | null;
};
