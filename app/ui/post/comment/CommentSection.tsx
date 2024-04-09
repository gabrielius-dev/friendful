"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { PrismaComment, PrismaPost } from "@/app/lib/types";
import { getCachedComments, getCachedPost } from "@/app/lib/serverUtils";
import Comment from "./Comment";
import CreateComment from "./CreateComment";
import { User } from "@prisma/client";
import CommentSkeleton from "./CommentSkeleton";

type EditPost = (postId: string, newPost: PrismaPost) => void;

interface CommentSectionProps {
  postId: string;
  currentUser: User;
  editPost: EditPost;
}

export default function CommentSection({
  postId,
  currentUser,
  editPost,
}: CommentSectionProps) {
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView();
  const [moreCommentsExist, setMoreCommentsExist] = useState(true);
  const [comments, setComments] = useState<PrismaComment[]>([]);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadComments() {
      setLoading(true);

      const fetchedComments = await getCachedComments(postId, currentUser.id);
      setComments(fetchedComments);
      setLoading(false);
      setMoreCommentsExist(fetchedComments.length === 10);
    }

    loadComments();
  }, [currentUser.id, postId]);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);

      const fetchedComments = await getCachedComments(
        postId,
        currentUser.id,
        comments[comments.length - 1].id
      );

      setComments((prevComments) => [...prevComments, ...fetchedComments]);
      setLoading(false);
      setMoreCommentsExist(fetchedComments.length === 10);
    };
    if (inView) {
      loadComments();
    }
  }, [comments, currentUser.id, inView, postId]);

  async function addComment(comment: PrismaComment) {
    const latestPost = await getCachedPost(postId, currentUser.id);
    if (latestPost) editPost(postId, latestPost);
    setComments((prevComments) => [comment, ...prevComments]);
    commentsContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const editComment = useCallback(
    (commentId: string, newComment: PrismaComment) => {
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === commentId) {
            return newComment;
          }
          return comment;
        })
      );
    },
    []
  );

  return (
    <div className="w-full border-t-[1px] border-t-gray-300 relative pt-4 flex flex-col gap-4">
      <div
        className="px-4 flex flex-col gap-4 break-all"
        ref={commentsContainerRef}
      >
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            editComment={editComment}
          />
        ))}
        {!loading && moreCommentsExist && <div ref={ref} />}
        {loading && <CommentSkeleton />}
      </div>
      <CreateComment
        postId={postId}
        currentUser={currentUser}
        addComment={addComment}
      />
    </div>
  );
}
