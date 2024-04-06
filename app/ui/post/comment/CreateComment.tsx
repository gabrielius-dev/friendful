"use client";

import { Avatar, Box, IconButton, Skeleton, TextField } from "@mui/material";
import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import Image from "next/image";
import { toast } from "react-toastify";
import { useFormStatus } from "react-dom";
import { PrismaComment } from "@/app/lib/types";
import { User } from "@prisma/client";
import { compressImage } from "@/app/lib/utils";
import { createComment } from "@/app/lib/actions";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

type AddComment = (comment: PrismaComment) => Promise<void>;

export default function CreateComment({
  currentUser,
  postId,
  addComment,
}: {
  currentUser: User;
  postId: string;
  addComment: AddComment;
}) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedImagesLength, setSelectedImagesLength] = useState(0);
  const textRef = useRef<HTMLInputElement>();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedPhotos = e.target.files;

    if (selectedPhotos) {
      setSelectedImagesLength(
        (prevLength) => selectedPhotos.length + prevLength
      );
      const selectedImagesArray: File[] = Array.from(selectedPhotos);

      for (const image of selectedImagesArray) {
        const compressedImage = await compressImage(image);

        setSelectedImages((prevSelectedImages) => [
          ...prevSelectedImages,
          compressedImage,
        ]);
      }
    }
  };

  function removeSelectedImage(image: File) {
    setSelectedImages((prevSelectedImages) =>
      prevSelectedImages.filter(
        (prevSelectedImage) => prevSelectedImage !== image
      )
    );
    setSelectedImagesLength((prevLength) => prevLength - 1);
  }

  const handleCommentSubmit = async (formData: FormData) => {
    if (selectedImagesLength !== selectedImages?.length) {
      toast.info(
        "Please wait a moment while the images are loading. This may take a few seconds.",
        {
          position: "bottom-left",
        }
      );
      return;
    }

    if (selectedImages.length > 0) {
      for (const image of selectedImages) {
        formData.append("images", image);
      }
    }

    try {
      const comment = await createComment(formData, postId);
      if (comment) await addComment(comment);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message, {
        position: "bottom-left",
      });
    } finally {
      setSelectedImages([]);
      setSelectedImagesLength(0);
      if (textRef.current) textRef.current.value = "";
    }
  };

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  return (
    <div className="bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-4 flex gap-2 items-center flex-col w-full sticky bottom-0">
      <div className="flex gap-2 items-center w-full">
        <Link
          href={`/profile/${currentUser.id}`}
          className="w-[40px] h-[40px] block"
        >
          <Avatar
            alt="Profile picture"
            src={currentUser?.image ?? undefined}
            sx={{
              width: 40,
              height: 40,
              background: currentUser.avatarBackgroundColor,
              "&:hover": {
                filter: "brightness(95%)",
              },
            }}
          >
            {!currentUser?.image ? currentUser?.name![0].toUpperCase() : null}
          </Avatar>
        </Link>
        <form
          className="grow flex items-center gap-2 bg-gray-100 rounded-3xl px-2 py-1"
          action={async (formData: FormData) => {
            await handleCommentSubmit(formData);
          }}
        >
          <TextField
            placeholder="Write your comment..."
            fullWidth
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            inputProps={{ maxLength: 1000 }}
            multiline
            maxRows={4}
            required={selectedImages.length === 0}
            name="text"
            id="text"
            inputRef={textRef}
            autoFocus={true}
          />
          <IconButton component="label" htmlFor="commentImageInput">
            <ImageOutlinedIcon sx={{ color: "#A9A9A9" }} />
            <input
              type="file"
              id="commentImageInput"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => void handleFileChange(e)}
            />
          </IconButton>
          <PostButton />
        </form>
      </div>
      {selectedImagesLength > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            overflowX: "auto",
            width: "100%",
            pt: 1,
          }}
        >
          {selectedImages.map((image, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                flexShrink: 0,
              }}
            >
              <IconButton
                sx={{
                  position: "absolute",
                  right: -10,
                  top: -10,
                  backgroundColor: "white",
                  borderRadius: 50,
                  p: 0.5,
                  "&:hover": {
                    backgroundColor: "white",
                  },
                }}
                onClick={() => removeSelectedImage(image)}
              >
                <ClearRoundedIcon
                  sx={{ width: 16, height: 16, color: "black" }}
                />
              </IconButton>
              <Image
                src={URL.createObjectURL(image)}
                style={{
                  objectFit: "cover",
                  borderRadius: 7,
                  width: "48px",
                  height: "48px",
                }}
                width={48}
                height={48}
                alt="Selected image"
              />
            </Box>
          ))}
          {Array.from(
            { length: selectedImagesLength - selectedImages.length },
            (_, i) => (
              <Box
                key={i}
                sx={{
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Skeleton
                  variant="rounded"
                  width="48px"
                  height="48px"
                  animation="wave"
                />
              </Box>
            )
          )}
        </Box>
      )}
    </div>
  );
}

function PostButton() {
  const { pending } = useFormStatus();
  return (
    <IconButton
      disabled={pending}
      type="submit"
      sx={{ cursor: pending ? "wait" : "pointer" }}
    >
      <SendRoundedIcon sx={{ color: "#A9A9A9" }} />
    </IconButton>
  );
}
