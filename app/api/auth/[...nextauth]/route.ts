// File: app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise, { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import type { UserRole, UserDocument } from "@/types/user";

// ================== Type Declarations ==================
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & NextAuthUser;
  }

  interface User extends NextAuthUser {
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

// ================== NextAuth Options ==================
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
        console.log("NextAuth Authorize: Attempting to authorize user:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error("NextAuth Authorize: Missing email or password in credentials.");
          throw new Error("Missing email or password.");
        }

        try {
          const db = await getDb();
          const usersAuthCollection = db.collection<UserDocument>("users_auth");

          const userDoc = await usersAuthCollection.findOne({
            email: credentials.email.toLowerCase(),
          });

          if (!userDoc) {
            console.warn("NextAuth Authorize: <<< FAILURE >>> No user found in database for email:", credentials.email.toLowerCase());
            throw new Error("Invalid email or password.");
          }

          console.log("NextAuth Authorize: User document found in DB:", { email: userDoc.email, role: userDoc.role });

          if (!userDoc.password) {
            console.error("NextAuth Authorize: <<< FAILURE >>> User document has no password field.");
            throw new Error("User account is not configured for password login.");
          }

          const isValidPassword = await bcrypt.compare(credentials.password, userDoc.password);

          if (!isValidPassword) {
            console.warn("NextAuth Authorize: <<< FAILURE >>> Password comparison failed for email:", credentials.email.toLowerCase());
            throw new Error("Invalid email or password.");
          }

          console.log("NextAuth Authorize: <<< SUCCESS >>> User authenticated successfully:", userDoc.email);

          return {
            id: userDoc._id!.toString(),
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
            image: userDoc.image || null,
          };
        } catch (error) {
          console.error("NextAuth Authorize: An unexpected error occurred during authorization:", error);
          throw error;
        }
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
        token.role = user.role;
        // token.name = user.name;
        // token.email = user.email;
        // token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        // session.user.name = token.name as string;
        // session.user.email = token.email as string;
        // session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    // error: "/auth/error",
    // verifyRequest: "/auth/verify-request",
    // newUser: "/welcome",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// ================== Handler ==================
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
