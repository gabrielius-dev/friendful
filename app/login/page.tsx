import LoginForm from "../ui/LoginForm";
import WelcomeMessage from "../ui/WelcomeMessage";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex items-stretch justify-center p-4">
        <LoginForm />
        <WelcomeMessage />
      </div>
    </div>
  );
}
