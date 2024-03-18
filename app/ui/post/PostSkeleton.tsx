import { Skeleton } from "@mui/material";

export default function PostSkeleton() {
  return (
    <article className="bg-white w-full flex rounded-3xl shadow p-4 flex-col gap-4 h-60">
      <header className="flex gap-2 items-center">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex flex-col">
          <Skeleton
            variant="text"
            height={20}
            width={90}
            sx={{ borderRadius: "1.5rem" }}
          />
          <Skeleton
            variant="text"
            height={20}
            width={110}
            sx={{ borderRadius: "1.5rem" }}
          />
        </div>
      </header>
      <footer className="w-full pt-1 flex flex-wrap gap-2 justify-around items-center mt-auto">
        <Skeleton
          variant="text"
          height={20}
          width={70}
          sx={{ borderRadius: "1.5rem" }}
        />
        <Skeleton
          variant="text"
          height={20}
          width={70}
          sx={{ borderRadius: "1.5rem" }}
        />
        <Skeleton
          variant="text"
          height={20}
          width={70}
          sx={{ borderRadius: "1.5rem" }}
        />
      </footer>
    </article>
  );
}
