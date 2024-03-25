"use server";

import { unstable_cache } from "next/cache";
import prisma from "./prisma";
import { ImageType, PrismaLike, PrismaPost } from "./types";
import { LikeType } from "@prisma/client";

async function getPosts(
  userId: string,
  myCursor: string | null
): Promise<PrismaPost[]> {
  let posts;
  if (myCursor)
    posts = await prisma.post.findMany({
      take: 10,
      skip: 1,
      cursor: {
        id: myCursor,
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            avatarBackgroundColor: true,
            id: true,
          },
        },
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
    });
  else
    posts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            avatarBackgroundColor: true,
            id: true,
          },
        },
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
  async (userId: string, myCursor: string | null = null) =>
    getPosts(userId, myCursor),
  ["posts"],
  {
    tags: ["posts"],
  }
);

async function getLikes(
  type: LikeType | "all",
  postId: string,
  myCursor: string | null
) {
  let likes: PrismaLike[];

  if (myCursor) {
    if (type === "all") {
      likes = await prisma.like.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
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
        cursor: { id: myCursor },
        skip: 1,
      });
    } else {
      likes = await prisma.like.findMany({
        where: { type, postId },
        orderBy: { createdAt: "desc" },
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
        cursor: { id: myCursor },
        skip: 1,
      });
    }
  } else {
    if (type === "all") {
      likes = await prisma.like.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
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
      });
    } else {
      likes = await prisma.like.findMany({
        where: { type, postId },
        orderBy: { createdAt: "desc" },
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
      });
    }
  }

  return likes;
}

export const getCachedLikes = unstable_cache(
  async (
    type: LikeType | "all",
    postId: string,
    myCursor: string | null = null
  ) => getLikes(type, postId, myCursor),
  ["likes"],
  {
    tags: ["likes"],
  }
);

async function getShares(postId: string, myCursor: string | null) {
  let shares;

  if (myCursor)
    shares = await prisma.share.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
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
      cursor: { id: myCursor },
      skip: 1,
    });
  else
    shares = await prisma.share.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
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
    });

  return shares;
}

export const getCachedShares = unstable_cache(
  async (postId: string, myCursor: string | null = null) =>
    getShares(postId, myCursor),
  ["shares"],
  {
    tags: ["shares"],
  }
);

async function getSaves(postId: string, myCursor: string | null) {
  let saves;

  if (myCursor)
    saves = await prisma.save.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
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
      cursor: {
        id: myCursor,
      },
      skip: 1,
    });
  else
    saves = await prisma.save.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
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
    });

  return saves;
}

export const getCachedSaves = unstable_cache(
  async (postId: string, myCursor: string | null = null) =>
    getSaves(postId, myCursor),
  ["saves"],
  {
    tags: ["saves"],
  }
);

async function getPost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          name: true,
          image: true,
          avatarBackgroundColor: true,
          id: true,
        },
      },
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
  });

  if (post) {
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
  } else return null;
}

export const getCachedPost = unstable_cache(
  async (postId: string, userId: string) => getPost(postId, userId),
  ["posts"],
  {
    tags: ["posts"],
  }
);
