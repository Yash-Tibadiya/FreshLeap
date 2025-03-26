import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db/index";
import { Users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { JWT } from "next-auth/jwt";

// Extend the built-in types
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    isVerified: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      isVerified: boolean;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isVerified: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const users = await db
            .select()
            .from(Users)
            .where(eq(Users.email, credentials.email));

          if (users.length === 0) {
            return null;
          }

          const user = users[0];

          // Check if user is verified - important for security
          if (!user.isVerified) {
            throw new Error("Please verify your email before signing in");
          }

          // Check if password exists
          if (!user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Check if role exists
          if (!user.role) {
            throw new Error("User role is missing");
          }

          // Return user object (without password)
          return {
            id: user.user_id,
            name: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      }
    })
  ],
  pages: {
    signIn: "/sign-in",
    // You can add other custom pages here if needed
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
