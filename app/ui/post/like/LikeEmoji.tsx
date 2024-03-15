import Image from "next/image";
import ColoredLikeIcon from "../../../../public/icons/colored-like.svg";
import LoveIcon from "../../../../public/icons/love.svg";
import CareIcon from "../../../../public/icons/care.svg";
import HahaIcon from "../../../../public/icons/haha.svg";
import WowIcon from "../../../../public/icons/wow.svg";
import SadIcon from "../../../../public/icons/sad.svg";
import AngryIcon from "../../../../public/icons/angry.svg";
import { LikeType } from "@prisma/client";

export default function LikeEmoji({
  emoji,
  size,
}: {
  emoji: LikeType;
  size: number;
}) {
  return (
    <>
      {emoji === "like" && (
        <Image
          alt="Like icon"
          src={ColoredLikeIcon}
          width={size}
          height={size}
        />
      )}
      {emoji === "love" && (
        <Image alt="Love icon" src={LoveIcon} width={size} height={size} />
      )}
      {emoji === "care" && (
        <Image alt="Care icon" src={CareIcon} width={size} height={size} />
      )}
      {emoji === "haha" && (
        <Image alt="Haha icon" src={HahaIcon} width={size} height={size} />
      )}
      {emoji === "wow" && (
        <Image alt="Wow icon" src={WowIcon} width={size} height={size} />
      )}
      {emoji === "sad" && (
        <Image alt="Sad icon" src={SadIcon} width={size} height={size} />
      )}
      {emoji === "angry" && (
        <Image alt="Angry icon" src={AngryIcon} width={size} height={size} />
      )}
    </>
  );
}
