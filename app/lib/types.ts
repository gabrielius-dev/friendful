import {
  Comment,
  Like,
  LikeType,
  Post as PostType,
  User as UserType,
} from "@prisma/client";
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

export type PrismaPost = PostType & {
  author: UserType;
  comments?: Comment[];
  likes: Like[];
  images: ImageType[] | JsonValue[];
  _count?: {
    likes?: number;
    comments?: number;
    share?: number;
    saved?: number;
  };
};

export type CountField =
  | "likeCount"
  | "loveCount"
  | "careCount"
  | "hahaCount"
  | "wowCount"
  | "sadCount"
  | "angryCount";

export type ReactionCount = {
  type: LikeType;
  count: number;
};

export type PrismaLike = Like & {
  user: {
    id: string;
    name: string;
    image: string | null;
    avatarBackgroundColor: string | null;
  };
};
