import NavigationBar from "./ui/NavigationBar";
import { currentUser } from "./lib/auth";
import Main from "./ui/index/Main";
import { Suspense } from "react";
import { User } from "@prisma/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainSkeleton from "./ui/index/MainSkeleton";

export default async function Home() {
  const user: User = (await currentUser())!;

  return (
    <div className="h-screen w-screen max-w-full">
      <NavigationBar currentUser={user} />
      <div className="flex justify-between gap-4 mt-[72px]">
        <Suspense fallback={<MainSkeleton />}>
          <Main />
        </Suspense>
      </div>
      <ToastContainer />
    </div>
  );
}
