"use server";

import { unstable_cache } from "next/cache";
import prisma from "./prisma";
import { ImageType, PrismaLike, PrismaPost } from "./types";
import { LikeType } from "@prisma/client";

async function getPosts(userId: string, skip: number): Promise<PrismaPost[]> {
  const posts = await prisma.post.findMany({
    include: {
      author: true,
      likes: {
        where: {
          userId,
        },
      },
      shares: {
        where: {
          userId,
        },
      },
      saves: {
        where: {
          userId,
        },
      },
      _count: {
        select: {
          comments: true,
          saves: true,
          shares: true,
          likes: true,
        },
      },
    },
    take: 10,
    skip,
    orderBy: { createdAt: "desc" },
  });

  const formattedPosts: PrismaPost[] = posts.map((post) => {
    const formattedImages: ImageType[] = post.images.map((image) => {
      if (
        image &&
        typeof image === "object" &&
        "src" in image &&
        "width" in image &&
        "height" in image
      ) {
        return {
          src: image.src as string,
          width: image.width as number,
          height: image.height as number,
        };
      }

      return { src: "", width: 0, height: 0 };
    });

    return {
      ...post,
      images: formattedImages,
    };
  });

  return formattedPosts;
}

export const getCachedPosts = unstable_cache(
  async (userId: string, skip: number = 0) => getPosts(userId, skip),
  ["posts"],
  {
    tags: ["posts"],
  }
);

async function getLikes(type: LikeType | "all", postId: string, skip: number) {
  let likes: PrismaLike[];

  if (type === "all") {
    likes = await prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            avatarBackgroundColor: true,
            id: true,
          },
        },
      },
      take: 10,
      skip,
    });
  } else {
    likes = await prisma.like.findMany({
      where: { type, postId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            avatarBackgroundColor: true,
            id: true,
          },
        },
      },
      take: 10,
      skip,
    });
  }

  return likes;
}

export const getCachedLikes = unstable_cache(
  async (type: LikeType | "all", postId: string, skip: number = 0) =>
    getLikes(type, postId, skip),
  ["likes"],
  {
    tags: ["likes"],
  }
);
