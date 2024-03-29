"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { CustomAuthError, ImageType, InitialErrors } from "./types";
import prisma from "./prisma";
import { AuthSchema, PostSchema } from "./schemas";
import { Prisma } from "@prisma/client/edge";
import bcrypt from "bcryptjs";
import { UploadApiOptions } from "cloudinary";
import cloudinary from "./cloudinary";
import { File } from "buffer";
import { revalidateTag } from "next/cache";
import { currentUser } from "./auth";
import { getRandomAvatarColor } from "./utils";

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
  const validatedFields = AuthSchema.safeParse({
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
        likes: [],
        saved: [],
        share: [],
      },
      include: {
        author: true,
      },
    });

    revalidateTag("posts");
    return post;
  }
}

export async function likePost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });
  const isPostLiked = post?.likes.includes(userId);
  const newLikes = isPostLiked
    ? post?.likes.filter((id) => id !== userId)
    : [...(post?.likes ?? []), userId];

  const newPost = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      likes: {
        set: newLikes,
      },
    },
    include: {
      author: true,
    },
  });

  revalidateTag("posts");

  return newPost;
}

export async function sharePost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  const newShare = [...(post?.share ?? []), userId];

  const newPost = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      share: {
        set: newShare,
      },
    },
    include: {
      author: true,
    },
  });

  revalidateTag("posts");

  return newPost;
}

export async function savePost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });
  const isPostSaved = post?.saved.includes(userId);
  const newSaves = isPostSaved
    ? post?.saved.filter((id) => id !== userId)
    : [...(post?.saved ?? []), userId];

  const newPost = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      saved: {
        set: newSaves,
      },
    },
    include: {
      author: true,
    },
  });

  revalidateTag("posts");

  return newPost;
}
