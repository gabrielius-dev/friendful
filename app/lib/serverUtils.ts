"use server";

import { unstable_cache } from "next/cache";
import prisma from "./prisma";
import { ImageType, PrismaPost } from "./types";

async function getPosts(userId: string, skip: number): Promise<PrismaPost[]> {
  const posts = await prisma.post.findMany({
    include: {
      author: true,
      likes: {
        where: {
          userId,
        },
      },
      _count: {
        select: {
          comments: true,
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
