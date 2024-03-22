"use client";

import { Avatar, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { PrismaShare } from "@/app/lib/types";
import Link from "next/link";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { getCachedShares } from "@/app/lib/serverUtils";
import { useInView } from "react-intersection-observer";
import ShareSkeleton from "./ShareSkeleton";

type SetShowShareList = Dispatch<SetStateAction<boolean>>;

interface ShareListProps {
  setShowShareList: SetShowShareList;
  postId: string;
}

export default function ShareList(props: ShareListProps) {
  const [shares, setShares] = useState<PrismaShare[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView();
  const [moreSharesExist, setMoreSharesExist] = useState(true);

  useEffect(() => {
    async function loadShares() {
      const fetchedShares = await getCachedShares(props.postId);
      setShares(fetchedShares);
      setLoading(false);
      setMoreSharesExist(fetchedShares.length === 10);
    }

    loadShares();
  }, [props.postId]);

  useEffect(() => {
    const loadShares = async () => {
      setLoading(true);

      const fetchedShares = await getCachedShares(props.postId, shares.length);

      setShares((prevShares) => [...prevShares, ...fetchedShares]);
      setLoading(false);
      setMoreSharesExist(fetchedShares.length === 10);
    };
    if (inView) {
      loadShares();
    }
  }, [inView, shares.length, props.postId]);

  return (
    <Dialog
      open={true}
      onClose={() => props.setShowShareList(false)}
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
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <div className="text-center w-full text-2xl font-bold">Shared by</div>

        <button
          aria-label="close"
          onClick={() => props.setShowShareList(false)}
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
          mt: 1,
        }}
      >
        {shares.map((share) => (
          <div key={share.id} className="flex gap-2 items-center break-all">
            <Link href={`/profile/${share.user.id}`}>
              <Avatar
                alt="Profile picture"
                src={share.user?.image ?? undefined}
                sx={{
                  width: 40,
                  height: 40,
                  background: share.user.avatarBackgroundColor,
                  "&:hover": {
                    filter: "brightness(95%)",
                  },
                }}
              >
                {!share.user?.image ? share.user.name![0].toUpperCase() : null}
              </Avatar>
            </Link>
            <Link href={`/profile/${share.user.id}`}>
              <p className={` font-medium hover:underline underline-offset-2`}>
                {share.user.name}
              </p>
            </Link>
            <button className="ml-auto min-w-fit p-2 bg-gray-200 rounded-lg font-medium flex gap-1 items-center hover:brightness-95">
              <PersonAddAltRoundedIcon /> <span>Add friend</span>
            </button>
          </div>
        ))}
        {loading && <ShareSkeleton />}
        {!loading && moreSharesExist && <div ref={ref} />}
      </DialogContent>
    </Dialog>
  );
}
