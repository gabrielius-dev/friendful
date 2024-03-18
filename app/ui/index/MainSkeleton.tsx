import PostSkeleton from "../post/PostSkeleton";
import StatusUpdateSkeleton from "../post/StatusUpdateSkeleton";

export default function MainSkeleton() {
  return (
    <div className="flex flex-col gap-4 flex-grow max-w-2xl items-center mx-auto px-2 mb-2">
      <StatusUpdateSkeleton />
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
}
