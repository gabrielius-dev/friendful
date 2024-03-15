"use client";

import Image from "next/image";
import ColoredLikeIcon from "../../../public/icons/colored-like.svg";
import LoveIcon from "../../../public/icons/love.svg";
import CareIcon from "../../../public/icons/care.svg";
import HahaIcon from "../../../public/icons/haha.svg";
import WowIcon from "../../../public/icons/wow.svg";
import SadIcon from "../../../public/icons/sad.svg";
import AngryIcon from "../../../public/icons/angry.svg";
import { LikeType } from "@prisma/client";
import { useState } from "react";

type HandleLike = (type: LikeType) => void;

export default function LikeSelector({
  handleLike,
}: {
  handleLike: HandleLike;
}) {
  const [likingInProgress, setLikingInProgress] = useState(false);
  return (
    <>
      <button
        className="transform transition-transform duration-200 ease-in-out hover:scale-110"
        onClick={() => {
          setLikingInProgress(true);
          handleLike("like");
        }}
        disabled={likingInProgress}
      >
        <Image alt="Like icon" src={ColoredLikeIcon} width={39} height={39} />
      </button>
      <button
        className="transform transition-transform duration-200 ease-in-out hover:scale-110"
        onClick={() => {
          setLikingInProgress(true);
          handleLike("love");
        }}
        disabled={likingInProgress}
      >
        <Image alt="Love icon" src={LoveIcon} width={39} height={39} />
      </button>
      <button
        className="transform transition-transform duration-200 ease-in-out hover:scale-110"
        onClick={() => {
          setLikingInProgress(true);
          handleLike("care");
        }}
        disabled={likingInProgress}
      >
        <Image alt="Care icon" src={CareIcon} width={39} height={39} />
      </button>
      <button
        className="transform transition-transform duration-200 ease-in-out hover:scale-110"
        onClick={() => {
          setLikingInProgress(true);
          handleLike("haha");
        }}
        disabled={likingInProgress}
      >
        <Image alt="Haha icon" src={HahaIcon} width={39} height={39} />
      </button>
      <button
        className="transform transition-transform duration-200 ease-in-out hover:scale-110"
        onClick={() => {
          setLikingInProgress(true);
          handleLike("wow");
        }}
        disabled={likingInProgress}
      >
        <Image alt="Wow icon" src={WowIcon} width={39} height={39} />
      </button>
      <button
        className="transform transition-transform duration-200 ease-in-out hover:scale-110"
        onClick={() => {
          setLikingInProgress(true);
          handleLike("sad");
        }}
        disabled={likingInProgress}
      >
        <Image alt="Sad icon" src={SadIcon} width={39} height={39} />
      </button>
      <button
        className="transform transition-transform duration-200 ease-in-out hover:scale-110"
        onClick={() => {
          setLikingInProgress(true);
          handleLike("angry");
        }}
        disabled={likingInProgress}
      >
        <Image alt="Angry icon" src={AngryIcon} width={39} height={39} />
      </button>
    </>
  );
}
