"use client";

import { Avatar, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { PrismaSave } from "@/app/lib/types";
import Link from "next/link";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { getCachedSaves } from "@/app/lib/serverUtils";
import { useInView } from "react-intersection-observer";
import SaveSkeleton from "./SaveSkeleton";

type SetShowSaveList = Dispatch<SetStateAction<boolean>>;

interface SaveListProps {
  setShowSaveList: SetShowSaveList;
  postId: string;
}

export default function SaveList(props: SaveListProps) {
  const [saves, setSaves] = useState<PrismaSave[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView();
  const [moreSavesExist, setMoreSavesExist] = useState(true);

  useEffect(() => {
    async function loadSaves() {
      const fetchedSaves = await getCachedSaves(props.postId);
      setSaves(fetchedSaves);
      setLoading(false);
      setMoreSavesExist(fetchedSaves.length === 10);
    }

    loadSaves();
  }, [props.postId]);

  useEffect(() => {
    const loadSaves = async () => {
      setLoading(true);

      const fetchedSaves = await getCachedSaves(
        props.postId,
        saves[saves.length - 1].id
      );

      setSaves((prevSaves) => [...prevSaves, ...fetchedSaves]);
      setLoading(false);
      setMoreSavesExist(fetchedSaves.length === 10);
    };
    if (inView) {
      loadSaves();
    }
  }, [inView, props.postId, saves]);

  return (
    <Dialog
      open={true}
      onClose={() => props.setShowSaveList(false)}
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
        <div className="text-center w-full text-2xl font-bold">Saved by</div>

        <button
          aria-label="close"
          onClick={() => props.setShowSaveList(false)}
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
        {saves.map((save) => (
          <div key={save.id} className="flex gap-2 items-center break-all">
            <Link href={`/profile/${save.user.id}`}>
              <Avatar
                alt="Profile picture"
                src={save.user?.image ?? undefined}
                sx={{
                  width: 40,
                  height: 40,
                  background: save.user.avatarBackgroundColor,
                  "&:hover": {
                    filter: "brightness(95%)",
                  },
                }}
              >
                {!save.user?.image ? save.user.name![0].toUpperCase() : null}
              </Avatar>
            </Link>
            <Link href={`/profile/${save.user.id}`}>
              <p className={` font-medium hover:underline underline-offset-2`}>
                {save.user.name}
              </p>
            </Link>
            <button className="ml-auto min-w-fit p-2 bg-gray-200 rounded-lg font-medium flex gap-1 items-center hover:brightness-95">
              <PersonAddAltRoundedIcon /> <span>Add friend</span>
            </button>
          </div>
        ))}
        {loading && <SaveSkeleton />}
        {!loading && moreSavesExist && <div ref={ref} />}
      </DialogContent>
    </Dialog>
  );
}
