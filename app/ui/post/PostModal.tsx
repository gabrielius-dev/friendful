"use client";

import { PrismaPost } from "@/app/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { User } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Post from "./Post";

type SetShowPostModal = Dispatch<SetStateAction<boolean>>;
type SetPostModalId = Dispatch<SetStateAction<string>>;
type EditPost = (postId: string, newPost: PrismaPost) => void;

interface PostModalProps {
  currentUser: User;
  post: PrismaPost;
  setShowPostModal: SetShowPostModal;
  setPostModalId: SetPostModalId;
  editPost: EditPost;
}

export default function PostModal(props: PostModalProps) {
  return (
    <Dialog
      open={true}
      onClose={() => props.setShowPostModal(false)}
      PaperProps={{ sx: { mx: 1, width: "100%", maxWidth: "700px" } }}
      sx={{ my: "72px", zIndex: 10000 }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          p: 2,
          py: 1,
          mb: 1,
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <div className="text-center w-full text-2xl font-bold">
          {props.post?.author.name}&apos;s post
        </div>
        <button
          aria-label="close"
          onClick={() => props.setShowPostModal(false)}
          className="ml-auto bg-gray-200 rounded-full px-2 py-1 hover:brightness-95"
        >
          <CloseRoundedIcon />
        </button>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowX: "hidden",
        }}
      >
        {props.post && (
          <Post
            post={props.post}
            currentUser={props.currentUser}
            editPost={props.editPost}
            setShowPostModal={props.setShowPostModal}
            setPostModalId={props.setPostModalId}
            showComments={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
