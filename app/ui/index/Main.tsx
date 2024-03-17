import { currentUser } from "../../lib/auth";
import { getCachedPosts } from "../../lib/serverUtils";
import PostManager from "../post/PostManager";

export default async function Main() {
  const user = (await currentUser())!;
  const posts = await getCachedPosts(user.id);

  return <PostManager currentUser={user} initialPosts={posts} />;
}
