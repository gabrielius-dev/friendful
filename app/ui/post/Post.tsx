"use client";

import { ImageType, PrismaPost, ReactionCount } from "@/app/lib/types";
import { formatDate, formatNumbers } from "@/app/lib/utils";
import { Avatar, IconButton, Menu, MenuItem, Skeleton } from "@mui/material";
import Link from "next/link";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  memo,
  useMemo,
  useRef,
  useState,
} from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PopupState, { bindMenu } from "material-ui-popup-state";
import {
  PopupState as PopupStateType,
  bindTrigger,
} from "material-ui-popup-state/hooks";
import { roboto } from "../fonts";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Image from "next/image";
import CommentIcon from "../../../public/icons/comment.svg";
import CommentFilledIcon from "../../../public/icons/comment-filled.svg";
import { LikeType, User } from "@prisma/client";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import { likePost, savePost, sharePost } from "@/app/lib/actions";
import { toast } from "react-toastify";
import LikeSelector from "./like/LikeSelector";
import LikeEmoji from "./like/LikeEmoji";
import LikeIcon from "../../../public/icons/like.svg";
import ShareIcon from "../../../public/icons/share.svg";
import ShareFilledIcon from "../../../public/icons/share-filled.svg";
import LikeList from "./like/LikeList";
import ShareList from "./share/ShareList";
import SaveList from "./save/SaveList";
import CommentSection from "./comment/CommentSection";

type EditPost = (postId: string, newPost: PrismaPost) => void;
type SetShowPostModal = Dispatch<SetStateAction<boolean>>;
type SetPostModalId = Dispatch<SetStateAction<string>>;

const Post = memo(function Post({
  post,
  currentUser,
  editPost,
  setShowPostModal,
  setPostModalId,
  showComments = false,
}: {
  post: PrismaPost;
  currentUser: User;
  editPost: EditPost;
  setShowPostModal: SetShowPostModal;
  setPostModalId: SetPostModalId;
  showComments?: boolean;
}) {
  const { author, id } = post;
  const { images } = post as { images: ImageType[] };
  const [index, setIndex] = useState(1);
  const [openImage, setOpenImage] = useState(false);
  const updateIndex = ({ index: current }: { index: number }) =>
    setIndex(current);
  const [loadingImages, setLoadingImages] = useState<number[]>([]);
  const arrangedImages = arrangeImages(images);
  const slides = arrangedImages.map((image) => {
    return {
      src: image.src as string,
      width: image.width as number,
      height: image.height as number,
    };
  });
  const [showLikeList, setShowLikeList] = useState(false);
  const [showShareList, setShowShareList] = useState(false);
  const [showSaveList, setShowSaveList] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);
  const [isLikingHovered, setIsLikingHovered] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userLike = post.likes[0];

  const reactionCounts: ReactionCount[] = useMemo(
    () =>
      [
        { type: "like" as LikeType, count: post.likeCount },
        { type: "love" as LikeType, count: post.loveCount },
        { type: "care" as LikeType, count: post.careCount },
        { type: "haha" as LikeType, count: post.hahaCount },
        { type: "wow" as LikeType, count: post.wowCount },
        { type: "sad" as LikeType, count: post.sadCount },
        { type: "angry" as LikeType, count: post.angryCount },
      ].sort((a, b) => b.count - a.count),
    [post]
  );

  function arrangeImages(images: ImageType[]) {
    const imageRatios = images.map((image) => image.width / image.height);

    const horizontalImages: ImageType[] = [];
    const verticalImages: ImageType[] = [];

    imageRatios.forEach((ratio, index) => {
      if (ratio >= 1) {
        horizontalImages.push(images[index]);
      } else {
        verticalImages.push(images[index]);
      }
    });

    let arrangedImages: ImageType[] = [];

    while (horizontalImages.length > 1) {
      arrangedImages.push(horizontalImages.pop()!);
      if (horizontalImages.length === 1 && arrangedImages.length % 2 !== 0)
        arrangedImages.push(horizontalImages.pop()!);
    }
    while (verticalImages.length > 1) {
      arrangedImages.push(verticalImages.pop()!);
      if (verticalImages.length === 1 && arrangedImages.length % 2 !== 0)
        arrangedImages.push(verticalImages.pop()!);
    }

    if (horizontalImages.length > 0) {
      arrangedImages = arrangedImages.concat(horizontalImages);
    }
    if (verticalImages.length > 0) {
      arrangedImages = arrangedImages.concat(verticalImages);
    }

    return arrangedImages;
  }

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

  async function deletePost(popupState: PopupStateType) {
    popupState.close();
  }

  const handleImageLoad = (index: number) => {
    setLoadingImages((prevLoadingImages) =>
      prevLoadingImages.filter((item) => item !== index)
    );
  };

  async function handleLike(type: LikeType, mainButtonClick = false) {
    setLikingInProgress(true);

    // Hide Like Selector
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsLikingHovered(false);

    const newPost = await likePost(id, type, currentUser.id, mainButtonClick);
    if (!newPost) {
      toast.info(
        "Sorry, the post you're trying to like has been deleted by the creator. Please refresh the page to see the latest content.",
        {
          position: "bottom-left",
        }
      );
    } else {
      editPost(id, newPost);
    }
    setLikingInProgress(false);
  }

  async function handleShare() {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_ROOT_URL}/post/${id}`
    );

    if (!toast.isActive(id))
      toast.info("Post link copied to clipboard.", {
        position: "bottom-left",
        toastId: id,
      });

    if (post.saves.length === 0) {
      const newPost = await sharePost(id, currentUser.id);
      if (!newPost) {
        toast.info(
          "Sorry, the post you're trying to share has been deleted by the creator. Please refresh the page to see the latest content.",
          {
            position: "bottom-left",
          }
        );
      } else {
        editPost(id, newPost);
      }
    }
  }

  async function handleSave() {
    setSavingInProgress(true);
    const newPost = await savePost(id, currentUser.id);
    if (!newPost) {
      toast.info(
        "Sorry, the post you're trying to save has been deleted by the creator. Please refresh the page to see the latest content.",
        {
          position: "bottom-left",
        }
      );
    } else {
      editPost(id, newPost);
    }
    setSavingInProgress(false);
  }

  function handleCommentClick() {
    if (!showComments) {
      setShowPostModal(true);
      setPostModalId(id);
    }
  }

  return (
    <article
      className={`bg-white w-full flex rounded-3xl ${
        !showComments ? "shadow p-4" : ""
      } flex-col gap-3`}
    >
      <header
        className={`flex gap-2 items-center ${
          showComments ? "px-4" : ""
        } break-all`}
      >
        <Link
          href={`/profile/${author?.id}`}
          className="w-[40px] h-[40px] block"
        >
          <Avatar
            alt="Profile picture"
            src={author?.image ?? undefined}
            sx={{
              width: 40,
              height: 40,
              background: author?.avatarBackgroundColor,
              "&:hover": {
                filter: "brightness(95%)",
              },
            }}
          >
            {!author?.image ? author?.name![0].toUpperCase() : null}
          </Avatar>
        </Link>
        <div className="flex flex-col">
          <Link href={`/profile/${author?.id}`} className="max-w-max">
            <strong>
              <span>{author?.name}</span>
            </strong>
          </Link>
          <p className="text-[#65676B] text-sm">
            {formatDate(
              post.createdAt instanceof Date
                ? post.createdAt
                : new Date(post.createdAt)
            )}
          </p>
        </div>
        <PopupState
          variant="popover"
          popupId="popup-menu"
          disableAutoFocus={true}
        >
          {(popupState) => (
            <Fragment>
              <IconButton sx={{ ml: "auto" }} {...bindTrigger(popupState)}>
                <MoreHorizIcon sx={{ color: "#65676B" }} />
              </IconButton>
              <Menu {...bindMenu(popupState)} sx={{ zIndex: 100000 }}>
                <MenuItem onClick={popupState.close}>Edit</MenuItem>
                <MenuItem
                  onClick={async () => void (await deletePost(popupState))}
                >
                  Delete
                </MenuItem>
              </Menu>
            </Fragment>
          )}
        </PopupState>
      </header>
      <div
        className={`flex flex-col gap-6 ${
          showComments ? "px-4" : ""
        } max-h-[800px] overflow-auto break-all`}
      >
        {post.content && (
          <div className={`${roboto.className} whitespace-pre-line`}>
            {post.content}
          </div>
        )}
        {arrangedImages.length > 0 && slides.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              placeItems: "center",
              gap: "16px",
            }}
          >
            {arrangedImages.map((image, index) => (
              <div
                key={index}
                className="cursor-pointer"
                onClick={() => {
                  updateIndex({ index });
                  setOpenImage(true);
                }}
              >
                {loadingImages.includes(index) && (
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    style={{
                      width: image.width,
                      height: image.height,
                    }}
                  />
                )}
                <Image
                  src={image.src}
                  alt={`Image ${index}`}
                  width={image.width}
                  height={image.height}
                  onLoad={() => handleImageLoad(index)}
                  className="rounded-2xl max-h-[500px]"
                />
              </div>
            ))}
            <Lightbox
              slides={slides}
              open={openImage}
              index={index}
              close={() => setOpenImage(false)}
              on={{ view: updateIndex }}
              styles={{
                container: {
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                },
                root: {
                  zIndex: 10000,
                },
              }}
              controller={{
                closeOnPullDown: true,
                closeOnBackdropClick: true,
              }}
            />
          </div>
        )}
      </div>
      <div
        className={`-my-2 flex text-[#65676B] flex-wrap justify-between ${
          showComments ? "px-4" : ""
        } break-all`}
      >
        {post._count.likes > 0 && (
          <>
            <div
              className="flex items-center cursor-pointer min-w-fit mr-4"
              onClick={() => setShowLikeList(true)}
            >
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
              <span className="ml-1 hover:underline">
                {formatNumbers(post._count.likes)}
              </span>
            </div>
            {showLikeList && (
              <LikeList
                setShowLikeList={setShowLikeList}
                reactionCounts={reactionCounts}
                entityId={id}
                type="Post"
              />
            )}
          </>
        )}
        <div className="flex-1 flex gap-4 min-w-fit justify-end">
          {post._count.comments > 0 && (
            <div
              className="cursor-pointer flex gap-1"
              onClick={handleCommentClick}
            >
              <Image
                alt="Comment icon"
                width={20}
                height={20}
                src={CommentFilledIcon}
              />
              <span>{formatNumbers(post._count.comments)}</span>
            </div>
          )}
          {post._count.shares > 0 && (
            <>
              <div
                className="cursor-pointer flex gap-1"
                onClick={() => setShowShareList(true)}
              >
                <Image
                  alt="Share icon"
                  width={20}
                  height={20}
                  src={ShareFilledIcon}
                />
                <span>{formatNumbers(post._count.shares)}</span>
              </div>
              {showShareList && (
                <ShareList setShowShareList={setShowShareList} postId={id} />
              )}
            </>
          )}
          {post._count.saves > 0 && (
            <>
              <div
                className="cursor-pointer flex gap-1"
                onClick={() => setShowSaveList(true)}
              >
                <BookmarkRoundedIcon />
                <span>{formatNumbers(post._count.saves)}</span>
              </div>
              {showSaveList && (
                <SaveList setShowSaveList={setShowSaveList} postId={id} />
              )}
            </>
          )}
        </div>
      </div>
      <div
        className={`border-t-[1px] border-t-gray-300 w-full pt-1 ${
          roboto.className
        } flex flex-wrap gap-2 justify-between items-center text-[#65676B] ${
          showComments ? "px-4" : ""
        } break-all`}
      >
        <div className="relative flex-1 flex min-w-fit">
          <button
            className={`flex-1 flex justify-center gap-1 items-center hover:bg-gray-100 p-2 rounded ${
              likingInProgress ? "cursor-wait" : ""
            }`}
            onClick={() => handleLike("like", true)}
            disabled={likingInProgress}
            onMouseEnter={showLikeSelector}
            onMouseLeave={hideLikeSelector}
            onTouchStart={showLikeSelector}
            onTouchEnd={hideLikeSelector}
          >
            {!!userLike ? (
              <LikeEmoji emoji={userLike.type} size={24} />
            ) : (
              <Image alt="Like icon" src={LikeIcon} width={24} height={24} />
            )}
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
            className={`transition-opacity duration-300 absolute bottom-11 -left-3 rounded-full shadow-md flex gap-1 p-1 bg-white min-w-max ${
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
        <button
          className="flex-1 justify-center min-w-fit flex gap-1 items-center hover:bg-gray-100 p-2 rounded"
          onClick={handleCommentClick}
        >
          <Image alt="Comment icon" width={24} height={24} src={CommentIcon} />
          <span>Comment</span>
        </button>
        <button
          className="flex-1 justify-center min-w-fit flex gap-1 items-center hover:bg-gray-100 p-2 rounded"
          onClick={handleShare}
        >
          <Image alt="Share icon" width={24} height={24} src={ShareIcon} />
          <span>Share</span>
        </button>
        <button
          className={`flex flex-1 justify-center min-w-fit gap-1 items-center hover:bg-gray-100 p-2 rounded ${
            savingInProgress ? "cursor-wait" : ""
          }`}
          onClick={handleSave}
          disabled={savingInProgress}
        >
          {post.saves.length !== 0 ? (
            <BookmarkRoundedIcon />
          ) : (
            <BookmarkBorderRoundedIcon />
          )}
          <span>{post.saves.length !== 0 ? "Saved" : "Save"}</span>
        </button>
      </div>
      {showComments && (
        <CommentSection
          postId={id}
          currentUser={currentUser}
          editPost={editPost}
        />
      )}
    </article>
  );
});

export default Post;
