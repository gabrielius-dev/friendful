import { Skeleton } from "@mui/material";

export default function CommentSkeleton() {
  return (
    <div className="flex gap-1 w-full">
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton
        variant="rounded"
        width="85%"
        height="50px"
        sx={{ borderRadius: "2rem" }}
      />
    </div>
  );
}
