import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./app/lib/prisma";
import bcrypt from "bcryptjs";
import { CustomAuthError } from "./app/lib/types";
import { formatZodErrors, getAuthUser } from "./app/lib/utils";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextResponse } from "next/server";
import { LoginSchema } from "./app/lib/schemas";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/login",
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getAuthUser(email);
          if (!user) throw new CustomAuthError({ email: ["Email not found"] });
          else if (user.accounts.length > 0) {
            const providers = user.accounts.map(
              (account) =>
                account.provider.charAt(0).toUpperCase() +
                account.provider.slice(1)
            );
            const message = `Use your ${providers.join(
              " or "
            )} account to login`;
            throw new Error(message);
          }
          const passwordsMatch = await bcrypt.compare(password, user.password!);

          if (passwordsMatch) return user;
          else throw new CustomAuthError({ password: ["Incorrect password"] });
        }

        if (!parsedCredentials.error.isEmpty) {
          const formattedErrors = formatZodErrors(parsedCredentials.error);
          throw new CustomAuthError(formattedErrors);
        }

        return null;
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },

    jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
        };
      }
      return token;
    },

    async authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthRoutes =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/sign-up");

      if (isOnAuthRoutes) {
        if (isLoggedIn) return NextResponse.redirect(nextUrl.origin);
        return true;
      }

      return !!auth?.user;
    },
  },
});
