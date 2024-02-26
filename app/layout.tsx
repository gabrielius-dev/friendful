import type { Metadata } from "next";
import { inter } from "./ui/fonts";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

export const metadata: Metadata = {
  title: "Friendful",
  description: "Connect with friends and share moments on Friendful",
  keywords: ["social media", "friends", "networking", "community"],
  authors: [{ name: "Gabrielius" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
      </body>
    </html>
  );
}
