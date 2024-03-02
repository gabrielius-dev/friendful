import { File } from "buffer";
import { z } from "zod";

export const AuthSchema = z.object({
  fullName: z
    .string({ required_error: "Full name must be specified" })
    .max(100)
    .optional(),
  email: z
    .string({ required_error: "Email must be specified" })
    .email("Invalid email")
    .max(100),
  password: z
    .string({ required_error: "Password must be specified" })
    .min(8)
    .max(100),
});

export const PostSchema = z
  .object({
    text: z.string().optional(),
    images: z
      .array(
        z
          .object({
            size: z.number(),
            type: z.string(),
            name: z.string(),
            lastModified: z.number(),
          })
          .refine(
            (file) => {
              if (file.size > 10 * 1024 * 1024) {
                throw new Error(
                  `File "${file.name}" exceeds the size limit of 10MB`
                );
              }
              if (!file.type.startsWith("image/")) {
                throw new Error(`File "${file.name}" is not of image type`);
              }
              return true;
            },
            {
              message: "File validation failed",
            }
          )
      )
      .optional(),
  })
  .refine(
    (data) => {
      const { text, images } = data;
      if (images?.length === 0) {
        return typeof text === "string" && text.trim() !== "";
      }
      return true; // Text is optional if images array is not empty
    },
    {
      message: "Text is required when images are empty",
    }
  );
