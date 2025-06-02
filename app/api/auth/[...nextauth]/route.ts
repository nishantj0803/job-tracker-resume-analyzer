// File: app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb"; // Your MongoDB client promise from lib/mongodb.ts
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb"; // Your function to get DB instance
import type { UserRole, UserDocument } from "@/types/user"; // Your UserDocument and UserRole types from types/user.ts

// Extend NextAuth.js's User and Session types to include your custom 'role' and 'id'
// This ensures that when you use useSession() or getToken(), these fields are typed correctly.
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Will be MongoDB ObjectId as string
      role: UserRole;
    } & NextAuthUser; // Keep existing fields like name, email, image
  }
  // This User type is used by the authorize callback and JWT/session callbacks
  interface User extends NextAuthUser { // This is the user object NextAuth works with internally for callbacks
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  // This is for the JWT token itself if you use JWT strategy
  interface JWT {
    id: string;
    role: UserRole;
    // You can add other properties from your user object if needed
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  }
}


export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB_NAME || "jobtrackr_db", // Ensure this matches your DB name in .env.local
    collections: { // Explicitly name collections NextAuth.js will use. This helps keep them separate.
        Users: "users_auth", // NextAuth will create/use this collection for its user model
        Accounts: "accounts_auth", // For OAuth provider accounts linked to users
        Sessions: "sessions_auth", // For database-based sessions (if strategy is "database")
        VerificationTokens: "verification_tokens_auth", // For email verification, magic links
    }
  }),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { // Defines the fields on the login form NextAuth expects
        email: { label: "Email", type: "email", placeholder: "name@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("NextAuth authorize: Missing email or password.");
          throw new Error("Missing email or password.");
        }

        const db = await getDb();
        // Query the collection used by the MongoDBAdapter (e.g., "users_auth")
        // This collection is where your custom registration endpoint will save users.
        const usersAuthCollection = db.collection<UserDocument>("users_auth"); 

        const userDoc = await usersAuthCollection.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!userDoc) {
          console.warn("NextAuth authorize: No user found with email:", credentials.email.toLowerCase());
          throw new Error("Invalid email or password.");
        }

        // The MongoDBAdapter stores users registered via other providers (OAuth) without a password.
        // Users registered via your custom /api/auth/register endpoint (which we'll create next) WILL have a password.
        if (!userDoc.password) {
            console.error("NextAuth authorize: User document in 'users_auth' has no password field for email:", userDoc.email);
            throw new Error("User account may not be configured for password login or password missing.");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          userDoc.password // 'password' field in your UserDocument stores the hashed password
        );

        if (!isValidPassword) {
          console.warn("NextAuth authorize: Invalid password for email:", credentials.email.toLowerCase());
          throw new Error("Invalid email or password.");
        }
        
        console.log("NextAuth authorize: User authenticated successfully:", userDoc.email, "Role:", userDoc.role);
        
        // Return the user object that NextAuth.js will use for the session.
        // This object's properties will be available in the JWT and Session callbacks.
        // Ensure it includes all fields you want in the session/token.
        return {
          id: userDoc._id!.toString(), // MongoDB _id needs to be converted to string
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role, // Crucial for admin/user distinction
          image: userDoc.image || null, // If you have it
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for session strategy is common and recommended for flexibility
    // maxAge: 30 * 24 * 60 * 60, // 30 days (optional)
    // updateAge: 24 * 60 * 60, // 24 hours (optional)
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // The 'user' object is passed on initial sign-in (from the authorize callback or OAuth provider).
      // Subsequent calls will only have 'token'.
      if (user) { // This block runs on sign-in
        token.id = user.id;
        token.role = user.role;
        // token.name = user.name; // name, email, picture are often included by default in token
        // token.email = user.email; // if not already there
        // token.picture = user.image; // if not already there
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client from the JWT.
      // The `token` object here is the output of the `jwt` callback.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        // session.user.name = token.name as string; // Ensure these are consistent if set in JWT
        // session.user.email = token.email as string;
        // session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Redirect users to /login if they need to sign in
    // error: '/auth/error', // Optional: Custom error page (e.g., /auth/error?error=CredentialsSignin)
    // verifyRequest: '/auth/verify-request', // For email magic links
    // newUser: '/welcome' // Redirect new OAuth users to a welcome page (optional)
  },
  secret: process.env.NEXTAUTH_SECRET, 
  debug: process.env.NODE_ENV === "development", 
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
