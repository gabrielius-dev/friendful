"use client";

import { PrismaComment, ReactionCount } from "@/app/lib/types";
import {
  formatCommentTime,
  formatNumbers,
  formatTooltipTime,
} from "@/app/lib/utils";
import { Avatar, Tooltip } from "@mui/material";
import Link from "next/link";
import LikeSelector from "../like/LikeSelector";
import { useMemo, useRef, useState } from "react";
import { LikeType, User } from "@prisma/client";
import { likeComment } from "@/app/lib/actions";
import { toast } from "react-toastify";
import { roboto } from "../../fonts";
import LikeEmoji from "../like/LikeEmoji";
import LikeList from "../like/LikeList";

type EditComment = (commentId: string, newComment: PrismaComment) => void;

export default function Comment({
  comment,
  currentUser,
  editComment,
}: {
  comment: PrismaComment;
  currentUser: User;
  editComment: EditComment;
}) {
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [isLikingHovered, setIsLikingHovered] = useState(false);
  const [showLikeList, setShowLikeList] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userLike = comment.likes[0];

  const reactionCounts: ReactionCount[] = useMemo(
    () =>
      [
        { type: "like" as LikeType, count: comment.likeCount },
        { type: "love" as LikeType, count: comment.loveCount },
        { type: "care" as LikeType, count: comment.careCount },
        { type: "haha" as LikeType, count: comment.hahaCount },
        { type: "wow" as LikeType, count: comment.wowCount },
        { type: "sad" as LikeType, count: comment.sadCount },
        { type: "angry" as LikeType, count: comment.angryCount },
      ].sort((a, b) => b.count - a.count),
    [comment]
  );

  function showLikeSelector() {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
    }
    if (!isLikingHovered) {
      hoverTimerRef.current = setTimeout(() => {
        setIsLikingHovered(true);
      }, 500);
    }
  }

  function hideLikeSelector() {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
    }

    if (isLikingHovered) {
      hoverTimerRef.current = setTimeout(() => {
        setIsLikingHovered(false);
      }, 500);
    }
  }

  async function handleLike(type: LikeType, mainButtonClick = false) {
    setLikingInProgress(true);

    // Hide Like Selector
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsLikingHovered(false);

    const newComment = await likeComment(
      comment.id,
      type,
      currentUser.id,
      mainButtonClick
    );
    if (!newComment) {
      toast.info(
        "Sorry, the comment you're trying to like has been deleted by the creator. Please refresh the page to see the latest content.",
        {
          position: "bottom-left",
        }
      );
    } else {
      editComment(comment.id, newComment);
    }
    setLikingInProgress(false);
  }

  return (
    <div className="flex gap-1">
      <Link
        href={`/profile/${comment.author?.id}`}
        className="w-[40px] h-[40px] block"
      >
        <Avatar
          alt="Profile picture"
          src={comment.author?.image ?? undefined}
          sx={{
            width: 40,
            height: 40,
            background: comment.author?.avatarBackgroundColor,
            "&:hover": {
              filter: "brightness(95%)",
            },
          }}
        >
          {!comment.author?.image
            ? comment.author?.name![0].toUpperCase()
            : null}
        </Avatar>
      </Link>
      <div className="flex flex-col">
        <div className="bg-[#f0f2f5] max-h-[300px] flex flex-col py-2 px-3 rounded-3xl max-w-max">
          <Link href={`/profile/${comment.author?.id}`} className="max-w-max">
            <span className="font-semibold text-sm">
              {comment.author?.name}
            </span>
          </Link>
          <div className={`${roboto.className} max-w-max overflow-auto`}>
            {comment.comment}
          </div>
        </div>
        <div className="flex gap-4 items-center flex-grow text-[#65676B] min-h-5">
          <Tooltip
            title={formatTooltipTime(
              comment.createdAt instanceof Date
                ? comment.createdAt
                : new Date(comment.createdAt)
            )}
            PopperProps={{ style: { zIndex: 10000 } }}
          >
            <div className="text-xs hover:underline text-[#65676B]">
              {formatCommentTime(
                comment.createdAt instanceof Date
                  ? comment.createdAt
                  : new Date(comment.createdAt)
              )}
            </div>
          </Tooltip>
          <div className="relative flex">
            <button
              className={`max-w-max text-xs font-semibold hover:underline ${
                likingInProgress ? "cursor-wait" : ""
              }`}
              onClick={() => handleLike("like", true)}
              disabled={likingInProgress}
              onMouseEnter={showLikeSelector}
              onMouseLeave={hideLikeSelector}
              onTouchStart={showLikeSelector}
              onTouchEnd={hideLikeSelector}
            >
              <span
                className={`${
                  !!userLike
                    ? userLike.type === "love"
                      ? "text-[#ff0000] font-semibold"
                      : userLike.type === "like"
                      ? "text-[#1877F2] font-semibold"
                      : "text-[#FFAE42] font-semibold"
                    : ""
                }`}
              >
                {!!userLike
                  ? userLike.type[0].toUpperCase() + userLike.type.slice(1)
                  : "Like"}
              </span>
            </button>
            <div
              className={`transition-opacity duration-300 absolute bottom-4 max-[340px]:-left-24 max-[360px]:-left-20 max-[370px]:-left-16 max-[380px]:-left-12 max-[400px]:-left-10 max-[410px]:-left-6 -left-4 rounded-full shadow-md flex gap-1 p-1 bg-white min-w-max ${
                isLikingHovered && !likingInProgress
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              onMouseEnter={showLikeSelector}
              onMouseLeave={hideLikeSelector}
              onTouchStart={showLikeSelector}
              onTouchEnd={hideLikeSelector}
            >
              {!likingInProgress && <LikeSelector handleLike={handleLike} />}
            </div>
          </div>
          <button className="text-xs font-semibold">Reply</button>
          {comment._count.likes > 0 && (
            <>
              <div
                className="flex items-center cursor-pointer ml-auto"
                onClick={() => setShowLikeList(true)}
              >
                <span className="mr-0.5 hover:underline text-sm">
                  {formatNumbers(comment._count.likes)}
                </span>
                {reactionCounts.map(
                  (reaction) =>
                    reaction.count > 0 && (
                      <LikeEmoji
                        key={reaction.type}
                        emoji={reaction.type}
                        size={20}
                      />
                    )
                )}
              </div>
              {showLikeList && (
                <LikeList
                  setShowLikeList={setShowLikeList}
                  reactionCounts={reactionCounts}
                  entityId={comment.id}
                  type="Comment"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
