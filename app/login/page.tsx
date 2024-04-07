import { Suspense } from "react";
import LoginForm from "../ui/auth/login/LoginForm";
import WelcomeMessage from "../ui/auth/WelcomeMessage";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex items-stretch justify-center p-4">
        <Suspense>
          <LoginForm />
        </Suspense>
        <WelcomeMessage />
      </div>
    </div>
  );
}
