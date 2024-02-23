import { poppins } from "./fonts";

export default function WelcomeMessage() {
  return (
    <div
      className={`hidden bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d] rounded-lg rounded-l-none shadow-lg p-8 text-white text-lg font-semibold items-center justify-center flex-col max-w-md md:flex ${poppins.className}`}
    >
      <h2 className="text-3xl font-semibold text-white mb-3 text-center">
        Welcome to Friendful
      </h2>
      <p className="text-lg text-white text-center">
        Rediscover friendship with Friendful. Connect effortlessly with your
        friends and explore shared moments together.
      </p>
    </div>
  );
}
