"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import {
  CustomAuthError,
  ImageType,
  InitialErrors,
  PrismaComment,
  PrismaPost,
} from "./types";
import prisma from "./prisma";
import { PostSchema, SignUpSchema } from "./schemas";
import { LikeType, Prisma } from "@prisma/client/edge";
import bcrypt from "bcryptjs";
import { UploadApiOptions } from "cloudinary";
import cloudinary from "./cloudinary";
import { File } from "buffer";
import { revalidateTag } from "next/cache";
import { currentUser } from "./auth";
import { getCountField, getRandomAvatarColor } from "./utils";

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
          } else if (error.cause?.err?.message)
            return error.cause?.err?.message;
        default:
          return "Something went wrong. Try again later!";
      }
    }
    throw error;
  }
}

export async function signUp(prevState: InitialErrors, formData: FormData) {
  const validatedFields = SignUpSchema.safeParse({
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
    await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        avatarBackgroundColor: getRandomAvatarColor(),
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
          } else if (error.cause?.err?.message)
            return error.cause?.err?.message;
        default:
          return "Something went wrong. Try again later!";
      }
    }
    throw error;
  }
}

const uploadToCloudinary = (options: UploadApiOptions, buffer: Buffer) => {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(buffer);
  });
};

export async function createPost(formData: FormData) {
  const images: File[] = [];

  for (const entry of formData.entries()) {
    const [name, file] = entry;

    if (name === "images" && file instanceof File) {
      images.push(file);
    }
  }

  const validatedFields = PostSchema.safeParse({
    text: formData.get("text"),
    images: images,
  });

  if (validatedFields.success) {
    const user = await currentUser();
    if (!user) {
      throw new Error("You must be logged in to create a post.");
    }

    const { text } = validatedFields.data;

    const uploadedImages: ImageType[] = [];

    if (images && images?.length > 0) {
      for (const image of images) {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadedImage = await uploadToCloudinary(
          {
            resource_type: "image",
            folder: "friendful/posts",
          },
          buffer
        );

        if (uploadedImage) {
          const { secure_url, width, height } = uploadedImage;
          uploadedImages.push({ src: secure_url, width, height });
        }
      }
    }

    const post = await prisma.post.create({
      data: {
        content: text,
        images: uploadedImages,
        authorId: user.id,
      },
      include: {
        author: true,
        likes: true,
        shares: true,
        saves: true,
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

    revalidateTag("posts");
    return post;
  }
}

export async function likePost(
  postId: string,
  type: LikeType,
  userId: string,
  mainButtonClick: boolean
) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      likes: {
        where: {
          postId,
          userId,
        },
      },
    },
  });

  if (!post) return null;

  const countField = getCountField(type)!;

  let newPost: PrismaPost;

  if (!!post.likes[0]) {
    const currentLikeCountField = getCountField(post.likes[0].type)!;

    if (post.likes[0].type === type || mainButtonClick) {
      await prisma.like.delete({
        where: {
          id: post.likes[0].id,
        },
      });

      newPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          [currentLikeCountField]: post[currentLikeCountField] - 1,
        },
        include: {
          author: true,
          likes: {
            where: {
              postId,
              userId,
            },
          },
          shares: {
            where: {
              postId,
              userId,
            },
          },
          saves: {
            where: {
              postId,
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
    } else {
      await prisma.like.update({
        where: {
          id: post.likes[0].id,
        },
        data: {
          type,
        },
      });

      newPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          [countField]: post[countField] + 1,
          [currentLikeCountField]: post[currentLikeCountField] - 1,
        },
        include: {
          author: true,
          likes: {
            where: {
              postId,
              userId,
            },
          },
          shares: {
            where: {
              postId,
              userId,
            },
          },
          saves: {
            where: {
              postId,
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
    }
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId,
        type,
      },
    });

    newPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        [countField]: post[countField] + 1,
      },
      include: {
        author: true,
        likes: {
          where: {
            postId,
            userId,
          },
        },
        shares: {
          where: {
            postId,
            userId,
          },
        },
        saves: {
          where: {
            postId,
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
  }

  revalidateTag("posts");
  revalidateTag("likes");

  return newPost;
}

export async function sharePost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      author: true,
      likes: {
        where: {
          postId,
          userId,
        },
      },
      shares: {
        where: {
          postId,
          userId,
        },
      },
      saves: {
        where: {
          postId,
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

  if (!post) return null;

  if (post.shares.length !== 0) return post;

  await prisma.share.create({
    data: {
      postId,
      userId,
    },
  });

  const newPost = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      author: true,
      likes: {
        where: {
          postId,
          userId,
        },
      },
      shares: {
        where: {
          postId,
          userId,
        },
      },
      saves: {
        where: {
          postId,
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

  revalidateTag("posts");
  revalidateTag("shares");

  return newPost;
}

export async function savePost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      author: true,
      likes: {
        where: {
          postId,
          userId,
        },
      },
      shares: {
        where: {
          postId,
          userId,
        },
      },
      saves: {
        where: {
          postId,
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

  if (!post) return null;

  if (post.saves.length !== 0) {
    await prisma.save.delete({ where: { id: post.saves[0].id } });
  } else {
    await prisma.save.create({
      data: {
        postId,
        userId,
      },
    });
  }

  const newPost = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      author: true,
      likes: {
        where: {
          postId,
          userId,
        },
      },
      shares: {
        where: {
          postId,
          userId,
        },
      },
      saves: {
        where: {
          postId,
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

  revalidateTag("posts");
  revalidateTag("saves");

  return newPost;
}

export async function createComment(formData: FormData, postId: string) {
  const images: File[] = [];

  for (const entry of formData.entries()) {
    const [name, file] = entry;

    if (name === "images" && file instanceof File) {
      images.push(file);
    }
  }

  const validatedFields = PostSchema.safeParse({
    text: formData.get("text"),
    images: images,
  });

  if (validatedFields.success) {
    const user = await currentUser();
    if (!user) {
      throw new Error("You must be logged in to create a comment.");
    }

    const { text } = validatedFields.data;

    const uploadedImages: ImageType[] = [];

    if (images && images?.length > 0) {
      for (const image of images) {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadedImage = await uploadToCloudinary(
          {
            resource_type: "image",
            folder: "friendful/posts/comments",
          },
          buffer
        );

        if (uploadedImage) {
          const { secure_url, width, height } = uploadedImage;
          uploadedImages.push({ src: secure_url, width, height });
        }
      }
    }

    const comment = await prisma.comment.create({
      data: {
        comment: text,
        images: uploadedImages,
        authorId: user.id,
        postId,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            avatarBackgroundColor: true,
            id: true,
          },
        },
        likes: true,
        _count: {
          select: {
            children: true,
            likes: true,
          },
        },
      },
    });

    revalidateTag("comments");
    revalidateTag("posts");
    return comment;
  }
}

export async function likeComment(
  commentId: string,
  type: LikeType,
  userId: string,
  mainButtonClick: boolean
) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      likes: {
        where: {
          commentId,
          userId,
        },
      },
    },
  });

  if (!comment) return null;

  const countField = getCountField(type)!;

  let newComment: PrismaComment;

  if (!!comment.likes[0]) {
    const currentLikeCountField = getCountField(comment.likes[0].type)!;

    if (comment.likes[0].type === type || mainButtonClick) {
      await prisma.commentLike.delete({
        where: {
          id: comment.likes[0].id,
        },
      });

      newComment = await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          [currentLikeCountField]: comment[currentLikeCountField] - 1,
        },
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
          _count: {
            select: {
              children: true,
              likes: true,
            },
          },
        },
      });
    } else {
      await prisma.commentLike.update({
        where: {
          id: comment.likes[0].id,
        },
        data: {
          type,
        },
      });

      newComment = await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          [countField]: comment[countField] + 1,
          [currentLikeCountField]: comment[currentLikeCountField] - 1,
        },
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
          _count: {
            select: {
              children: true,
              likes: true,
            },
          },
        },
      });
    }
  } else {
    await prisma.commentLike.create({
      data: {
        userId,
        commentId,
        type,
      },
    });

    newComment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        [countField]: comment[countField] + 1,
      },
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
        _count: {
          select: {
            children: true,
            likes: true,
          },
        },
      },
    });
  }

  revalidateTag("comments");
  revalidateTag("commentLikes");

  return newComment;
}
