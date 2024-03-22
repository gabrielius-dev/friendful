import { Skeleton } from "@mui/material";

export default function ShareSkeleton() {
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
