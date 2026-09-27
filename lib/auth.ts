// lib/auth.ts — NextAuth options (separate from the route handler so
// Next.js 15 route-type validation doesn't reject non-route exports).
import type { NextAuthOptions, DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise, { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import type { UserRole, UserDocument } from "@/types/user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB_NAME || "jobtrackr_db",
    collections: {
      Users: "users_auth",
      Accounts: "accounts_auth",
      Sessions: "sessions_auth",
      VerificationTokens: "verification_tokens_auth",
    },
  }),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "name@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password.");
        }

        const db = await getDb();
        const usersAuthCollection = db.collection<UserDocument>("users_auth");

        const userDoc = await usersAuthCollection.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!userDoc || !userDoc.password) {
          throw new Error("Invalid email or password.");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          userDoc.password
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: userDoc._id!.toString(),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          image: userDoc.image || null,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
