"use client";

import {
  Avatar,
  Badge,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
} from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { PrismaCommentLike, PrismaLike, ReactionCount } from "@/app/lib/types";
import LikeEmoji from "./LikeEmoji";
import { formatNumbers } from "@/app/lib/utils";
import { LikeType } from "@prisma/client";
import Link from "next/link";
import { roboto } from "../../fonts";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { getCachedCommentLikes, getCachedLikes } from "@/app/lib/serverUtils";
import { useInView } from "react-intersection-observer";

type SetShowLikeList = Dispatch<SetStateAction<boolean>>;

interface LikeListProps {
  setShowLikeList: SetShowLikeList;
  reactionCounts: ReactionCount[];
  entityId: string;
  type: "Post" | "Comment";
}

export default function LikeList(props: LikeListProps) {
  const [likes, setLikes] = useState<PrismaLike[] | PrismaCommentLike[]>([]);
  const [selectedType, setSelectedType] = useState<LikeType | "all">("all");
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView();
  const [moreLikesExist, setMoreLikesExist] = useState(true);

  useEffect(() => {
    async function loadLikes() {
      let fetchedLikes;

      if (props.type === "Post")
        fetchedLikes = await getCachedLikes("all", props.entityId);
      else fetchedLikes = await getCachedCommentLikes("all", props.entityId);

      setLikes(fetchedLikes);
      setLoading(false);
      setMoreLikesExist(fetchedLikes.length === 10);
    }

    loadLikes();
  }, [props.entityId, props.type]);

  async function handleReactionClick(type: LikeType | "all") {
    if (selectedType === type || loading) return;

    setLoading(true);
    setSelectedType(type);
    setLikes([]);

    let fetchedLikes;

    if (props.type === "Post")
      fetchedLikes = await getCachedLikes(type, props.entityId);
    else fetchedLikes = await getCachedCommentLikes(type, props.entityId);

    setLikes(fetchedLikes);
    setLoading(false);
    setMoreLikesExist(fetchedLikes.length === 10);
  }

  useEffect(() => {
    const loadLikes = async () => {
      setLoading(true);

      let fetchedLikes: PrismaLike[] | PrismaCommentLike[];

      if (props.type === "Post")
        fetchedLikes = await getCachedLikes(
          selectedType,
          props.entityId,
          likes[likes.length - 1].id
        );
      else
        fetchedLikes = await getCachedCommentLikes(
          selectedType,
          props.entityId,
          likes[likes.length - 1].id
        );

      function isPrismaLikeArray(
        array: PrismaLike[] | PrismaCommentLike[]
      ): array is PrismaLike[] {
        return Array.isArray(array) && array.length > 0 && "postId" in array[0];
      }

      setLikes((prevLikes) => {
        if (isPrismaLikeArray(prevLikes)) {
          // prevLikes is PrismaLike[]
          return [...prevLikes, ...(fetchedLikes as PrismaLike[])];
        } else {
          // prevLikes is PrismaCommentLike[]
          return [...prevLikes, ...(fetchedLikes as PrismaCommentLike[])];
        }
      });

      setLoading(false);
      setMoreLikesExist(fetchedLikes.length === 10);
    };
    if (inView) {
      loadLikes();
    }
  }, [inView, likes, props.entityId, props.type, selectedType]);

  return (
    <Dialog
      open={true}
      onClose={() => props.setShowLikeList(false)}
      maxWidth="sm"
      PaperProps={{ sx: { mx: 1, width: "100%" } }}
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
        }}
      >
        <div className="flex-1 flex overflow-auto pb-2">
          <button
            className={`${
              selectedType === "all"
                ? "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d] text-transparent bg-clip-text"
                : "text-[#65676B] hover:bg-gray-100"
            } text-center p-4 rounded-xl relative text-base font-semibold ${
              roboto.className
            } ${loading ? "cursor-wait" : ""}`}
            onClick={() => handleReactionClick("all")}
            disabled={loading}
          >
            All
            {selectedType === "all" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]"></span>
            )}
          </button>
          {props.reactionCounts.map(
            (reaction) =>
              reaction.count > 0 && (
                <button
                  key={reaction.type}
                  className={`${
                    selectedType === reaction.type
                      ? reaction.type === "love"
                        ? "text-[#ff0000]"
                        : reaction.type === "like"
                        ? "text-[#1877F2]"
                        : "text-[#FFAE42]"
                      : "hover:bg-gray-100 text-[#65676B]"
                  } flex gap-1 justify-center items-center p-4 rounded-xl relative text-base font-medium min-w-fit ${
                    roboto.className
                  } ${loading ? "cursor-wait" : ""}`}
                  onClick={() => handleReactionClick(reaction.type)}
                  disabled={loading}
                >
                  <LikeEmoji emoji={reaction.type} size={20} />
                  <span>{formatNumbers(reaction.count)}</span>
                  {selectedType === reaction.type && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]"></span>
                  )}
                </button>
              )
          )}
        </div>

        <button
          aria-label="close"
          onClick={() => props.setShowLikeList(false)}
          className="ml-auto bg-gray-200 rounded-full px-2 py-1 hover:brightness-95"
        >
          <CloseRoundedIcon />
        </button>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {likes.map((like) => (
          <div key={like.id} className="flex gap-2 items-center break-all">
            <Link href={`/profile/${like.user.id}`}>
              <Badge
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={<LikeEmoji emoji={like.type} size={20} />}
                overlap="circular"
              >
                <Avatar
                  alt="Profile picture"
                  src={like.user?.image ?? undefined}
                  sx={{
                    width: 40,
                    height: 40,
                    background: like.user.avatarBackgroundColor,
                    "&:hover": {
                      filter: "brightness(95%)",
                    },
                  }}
                >
                  {!like.user?.image ? like.user.name![0].toUpperCase() : null}
                </Avatar>
              </Badge>
            </Link>
            <Link href={`/profile/${like.user.id}`}>
              <p className={` font-medium hover:underline underline-offset-2`}>
                {like.user.name}
              </p>
            </Link>
            <button className="ml-auto min-w-fit p-2 bg-gray-200 rounded-lg font-medium flex gap-1 items-center hover:brightness-95">
              <PersonAddAltRoundedIcon /> <span>Add friend</span>
            </button>
          </div>
        ))}
        {loading && <LikeSkeleton />}
        {!loading && moreLikesExist && <div ref={ref} />}
      </DialogContent>
    </Dialog>
  );
}

function LikeSkeleton() {
  return (
    <div className="max-w-[600px] flex gap-2 items-center">
      <Skeleton variant="circular" animation="pulse" width={40} height={40} />
      <Skeleton
        variant="text"
        animation="pulse"
        height={30}
        sx={{ flex: 1, maxWidth: 390 }}
      />
    </div>
  );
}
