import { Post as PostType, User as UserType } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

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

export type ImageType = { src: string; width: number; height: number };

export type PostWithAuthor = PostType & {
  author: UserType | null;
  images: ImageType[] | JsonValue[];
};
