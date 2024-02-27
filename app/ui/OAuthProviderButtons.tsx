"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import GoogleIcon from "../../public/icons/google.svg";
import GithubIcon from "../../public/icons/github.svg";
import { signIn } from "next-auth/react";

export default function OAuthProviderButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="w-full flex gap-4 flex-wrap justify-center">
      <button
        className="px-4 py-2 border flex gap-2 border-slate-200 rounded-lg text-slate-700  hover:border-slate-400  hover:text-slate-900  hover:shadow transition duration-150 min-w-fit flex-grow justify-center"
        disabled={pending}
        onClick={() => {
          signIn("google");
        }}
        type="button"
      >
        <Image
          src={GoogleIcon}
          loading="lazy"
          alt="google logo"
          width={24}
          height={24}
        />
        <span>Google</span>
      </button>

      <button
        className="px-4 py-2 border flex gap-2 border-slate-200  rounded-lg text-slate-700  hover:border-slate-400  hover:text-slate-900  hover:shadow transition duration-150 min-w-fit flex-grow justify-center"
        disabled={pending}
        onClick={() => {
          signIn("github");
        }}
        type="button"
      >
        <Image
          src={GithubIcon}
          loading="lazy"
          alt="github logo"
          width={24}
          height={24}
        />
        <span>Github</span>
      </button>
    </div>
  );
}
