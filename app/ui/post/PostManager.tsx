"use client";

import StatusUpdate from "./StatusUpdate";
import { useCallback, useEffect, useState } from "react";
import { getCachedPosts } from "@/app/lib/serverUtils";
import Post from "./Post";
import { PrismaPost } from "@/app/lib/types";
import { User } from "@prisma/client";
import { useInView } from "react-intersection-observer";
import PostSkeleton from "./PostSkeleton";

export default function PostManager({
  currentUser,
  initialPosts,
}: {
  currentUser: User;
  initialPosts: PrismaPost[];
}) {
  const [posts, setPosts] = useState<PrismaPost[]>(initialPosts);
  const [morePostsExist, setMorePostsExist] = useState(
    initialPosts.length === 10
  );
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView();

  const addPost = useCallback((post: PrismaPost) => {
    setPosts((prevPosts) => [post, ...prevPosts]);
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);

      const fetchedPosts = await getCachedPosts(currentUser.id, posts.length);

      setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
      setLoading(false);

      setMorePostsExist(fetchedPosts.length === 10);
    };

    if (inView) {
      loadPosts();
    }
  }, [currentUser.id, inView, posts.length]);

  const editPost = useCallback((postId: string, newPost: PrismaPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return newPost;
        }
        return post;
      })
    );
  }, []);

  return (
    <div className="flex flex-col gap-4 flex-grow max-w-2xl items-center mx-auto px-2 mb-2">
      <StatusUpdate currentUser={currentUser} addPost={addPost} />
      {posts.map((post) => (
        <Post
          post={post}
          key={post.id}
          currentUser={currentUser}
          editPost={editPost}
        />
      ))}
      {!loading && morePostsExist && <div ref={ref} />}
      {loading && <PostSkeleton />}
    </div>
  );
}
