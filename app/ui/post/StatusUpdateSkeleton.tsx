import { Skeleton } from "@mui/material";

export default function StatusUpdateSkeleton() {
  return (
    <div className="bg-white shadow m-4 p-3 rounded-3xl flex gap-2 items-center flex-col mx-auto w-full">
      <div className="flex gap-2 items-center w-full">
        <Skeleton variant="circular" height={40} width={40} />
        <div className="grow flex items-center gap-2">
          <Skeleton
            variant="rounded"
            sx={{ flex: 1, borderRadius: "1.5rem" }}
            height={30}
          />
          <Skeleton variant="rounded" height={24} width={24} />
          <Skeleton
            variant="rounded"
            height={40}
            width={67}
            sx={{ borderRadius: "1.5rem" }}
          />
        </div>
      </div>
    </div>
  );
}
