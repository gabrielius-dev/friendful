import {
  Comment,
  CommentLike,
  Like,
  LikeType,
  Post as PostType,
  Save,
  Share,
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

type UserType = {
  id: string;
  name: string;
  image: string | null;
  avatarBackgroundColor: string | null;
};

export type ImageType = { src: string; width: number; height: number };

export type PrismaPost = PostType & {
  author: UserType;
  comments?: Comment[];
  likes: Like[];
  images: ImageType[] | JsonValue[];
  shares: Share[];
  saves: Save[];
  _count: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
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
  user: UserType;
};

export type PrismaShare = Share & {
  user: UserType;
};

export type PrismaSave = Save & {
  user: UserType;
};

export type PrismaComment = Comment & {
  author: UserType;
  likes: CommentLike[];
  images: ImageType[] | JsonValue[];
  _count: {
    likes: number;
    children: number;
  };
};

export type PrismaCommentLike = CommentLike & {
  user: UserType;
};
