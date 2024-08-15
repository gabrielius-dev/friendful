"use client";

import { PrismaComment, PrismaPost, ReactionCount } from "@/app/lib/types";
import { formatNumbers, formatTooltipTime } from "@/app/lib/utils";
import { Avatar, Tooltip } from "@mui/material";
import Link from "next/link";
import LikeSelector from "../like/LikeSelector";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LikeType, User } from "@prisma/client";
import { likeComment } from "@/app/lib/actions";
import { toast } from "react-toastify";
import { roboto } from "../../fonts";
import LikeEmoji from "../like/LikeEmoji";
import LikeList from "../like/LikeList";
import CreateComment from "./CreateComment";
import { getCachedComments, getCachedPost } from "@/app/lib/serverUtils";
import { useTimeAgo } from "react-time-ago";
import en from "javascript-time-ago/locale/en";
import TimeAgo from "javascript-time-ago";

type EditComment = (commentId: string, newComment: PrismaComment) => void;
type EditPost = (postId: string, newPost: PrismaPost) => void;
type StartReplying = (name: string) => void;

TimeAgo.addDefaultLocale(en);

export default function Comment({
  depth,
  comment,
  currentUser,
  editComment,
  postId,
  editPost,
  startReplying,
}: {
  depth: number;
  comment: PrismaComment;
  currentUser: User;
  editComment: EditComment;
  postId: string;
  editPost: EditPost;
  startReplying?: StartReplying;
}) {
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [isLikingHovered, setIsLikingHovered] = useState(false);
  const [showLikeList, setShowLikeList] = useState(false);
  const [showCreateReply, setShowCreateReply] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moreRepliesExist, setMoreRepliesExist] = useState(false);
  const [focusCreateReply, setFocusCreateReply] = useState(false);
  const [replies, setReplies] = useState<PrismaComment[]>([]);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userLike = comment.likes[0];
  const repliesContainerRef = useRef<HTMLDivElement>(null);
  const [replyMention, setReplyMention] = useState("");
  // if depth more than 0 use my own edit comment function and also createcomment component should use my own add comment function ALWAYS USED PASSED FUNCTIONS EDITCOMMENT ADDCOMMENT
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

  // Functions for comment replies
  const addReply = useCallback(
    async (comment: PrismaComment) => {
      const latestPost = await getCachedPost(postId, currentUser.id);
      if (latestPost) editPost(postId, latestPost);
      setReplies((prevReplies) => [comment, ...prevReplies]);
      repliesContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [currentUser.id, editPost, postId]
  );

  const editReply = useCallback(
    (commentId: string, newComment: PrismaComment) => {
      setReplies((prevReplies) =>
        prevReplies.map((reply) => {
          if (reply.id === commentId) {
            return newComment;
          }
          return reply;
        })
      );
    },
    []
  );

  async function handleShowReplies() {
    setShowCreateReply(true);
    await loadReplies();
  }

  async function loadReplies() {
    setLoading(true);

    let fetchedReplies: PrismaComment[];

    if (replies.length > 0) {
      fetchedReplies = await getCachedComments(
        postId,
        currentUser.id,
        replies[replies.length - 1].id,
        comment.id
      );
      setReplies((prevReplies) => [...prevReplies, ...fetchedReplies]);
    } else {
      fetchedReplies = await getCachedComments(
        postId,
        currentUser.id,
        null,
        comment.id
      );
      setReplies(fetchedReplies);
    }

    setLoading(false);
    setMoreRepliesExist(fetchedReplies.length === 10);
  }

  function startReply(name: string) {
    setFocusCreateReply((prevState) => !prevState);
    setReplyMention(name);
  }

  useEffect(() => {
    console.log(replyMention);
  }, [replyMention]);

  //! WHERE does the image go after adding them?

  //todo fix like selector for comments and replies ;) change createcomment placeholder text to answer to NAME and mentions and :D

  // fix the overflow, content not being able to grow

  const result = useTimeAgo({
    date:
      comment.createdAt instanceof Date
        ? comment.createdAt
        : new Date(comment.createdAt),
    timeStyle: "mini",
    locale: "en",
    updateInterval: 1000,
  });

  //TODO: 1. Komentaras 2. Reply ir komentaro CreateComment 3. Replyjo replies ir reply CreateComment, tai visų tų replyjo repliejų CreateComment būna Replyjo CreateComment tsg su @tag D:

  return (
    <div className="flex flex-col gap-1 relative ">
      {depth > 0 && (
        <>
          <div className="absolute w-[2px] bg-[#F0F2F5] left-5 -top-4 h-[calc(100%+16px)]" />
          <div className="absolute border-b-2 border-l-2 border-solid border-[#F0F2F5] rounded-bl-lg left-5 w-5 h-5" />
        </>
      )}
      <div
        className={`flex flex-col gap-1 ${
          depth > 0 ? "pl-10" : ""
        } relative min-w-fit`}
      >
        <div className="flex gap-1 relative">
          {(replies.length > 0 ||
            showCreateReply ||
            (comment._count.children > 0 &&
              replies.length < comment._count.children)) && (
            <div className="absolute w-[2px] bg-[#F0F2F5] left-5 top-[44px] h-[calc(100%-46px)]" />
          )}
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
          <div className="flex-1 flex flex-col">
            <div className="bg-[#f0f2f5] max-h-[300px] flex flex-col py-2 px-3 rounded-3xl max-w-max">
              <Link
                href={`/profile/${comment.author?.id}`}
                className="max-w-max"
              >
                <span className="font-semibold text-sm">
                  {comment.author?.name}
                </span>
              </Link>
              <div className={`${roboto.className} max-w-max overflow-auto`}>
                {comment.comment}
              </div>
            </div>
            <div className="flex gap-4 items-center text-[#65676B] min-h-5 min-w-max mt-0.5">
              <Tooltip
                title={formatTooltipTime(
                  comment.createdAt instanceof Date
                    ? comment.createdAt
                    : new Date(comment.createdAt)
                )}
                PopperProps={{ style: { zIndex: 10000 } }}
              >
                <div className="text-xs hover:underline text-[#65676B]">
                  {result.formattedDate}
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
                  className={`transition-opacity duration-300 absolute bottom-4 max-[340px]:-left-[92px] max-[354px]:-left-[88px] max-[370px]:-left-20 max-[400px]:-left-16 max-[420px]:-left-12 -left-4 rounded-full shadow-md flex gap-1 p-1 bg-white ${
                    isLikingHovered && !likingInProgress
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                  onMouseEnter={showLikeSelector}
                  onMouseLeave={hideLikeSelector}
                  onTouchStart={showLikeSelector}
                  onTouchEnd={hideLikeSelector}
                >
                  {!likingInProgress && isLikingHovered && (
                    <LikeSelector handleLike={handleLike} />
                  )}
                </div>
              </div>
              <button
                className="text-xs font-semibold hover:underline"
                onClick={() => {
                  if (depth < 2) {
                    setShowCreateReply(true);
                    startReply(comment.author.name);
                  }
                  if (depth === 2 && typeof startReplying === "function") {
                    startReplying(comment.author.name);
                  }
                }}
              >
                Reply
              </button>
              {comment._count.likes > 0 && (
                <>
                  <div
                    className="flex items-center cursor-pointer"
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
        {comment._count.children > 0 &&
          replies.length < comment._count.children && (
            <div className="relative flex justify-start max-w-max mt-1 pl-10">
              <div className="absolute border-b-2 border-l-2 border-solid border-[#F0F2F5] rounded-bl-lg -top-3 left-5 w-5 h-[26px]" />
              <button onClick={handleShowReplies} className="">
                View all replies ({comment._count.children})
              </button>
            </div>
          )}
        {replies.length > 0 && depth < 1 && (
          <div ref={repliesContainerRef} className="flex flex-col gap-2 mt-1">
            {replies.map((reply) => (
              <Comment
                key={reply.id}
                depth={depth + 1}
                comment={reply}
                currentUser={currentUser}
                editComment={editReply}
                postId={postId}
                editPost={editPost}
              />
            ))}
          </div>
        )}
        {replies.length > 0 && depth === 1 && (
          <div ref={repliesContainerRef} className="flex flex-col gap-2 mt-1">
            {replies.map((reply) => (
              <Comment
                key={reply.id}
                depth={depth + 1}
                comment={reply}
                currentUser={currentUser}
                editComment={editReply}
                postId={postId}
                editPost={editPost}
                startReplying={startReply}
              />
            ))}
          </div>
        )}
        {showCreateReply && depth < 2 && (
          <div className="relative" id={comment.id}>
            <div className="absolute border-b-2 border-l-2 border-solid border-[#F0F2F5] rounded-bl-lg -top-6 left-5 w-5 h-[52px]" />
            <div
              className="pl-10"
              style={{
                width: "clamp(min(80vw,360px), min(80vw, 100%), min(,668px))",
              }}
            >
              <CreateComment
                currentUser={currentUser}
                postId={postId}
                addComment={addReply}
                parentId={comment.id}
                key={comment.id}
                focusReply={focusCreateReply}
                replyMention={replyMention}
                setReplyMention={setReplyMention}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
