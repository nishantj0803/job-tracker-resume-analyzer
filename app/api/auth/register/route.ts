// File: app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb"; // Your function to get DB instance
import bcrypt from "bcryptjs";
import type { UserRole, UserDocument } from "@/types/user"; // Your UserDocument and UserRole types
import { ObjectId } from "mongodb"; // Import ObjectId

export async function POST(request: NextRequest) {
  console.log("REGISTER_API: POST request received.");
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      console.warn("REGISTER_API: Missing required fields (name, email, or password).");
      return NextResponse.json({ message: "Name, email, and password are required." }, { status: 400 });
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        console.warn("REGISTER_API: Invalid email format:", email);
        return NextResponse.json({ message: "Invalid email format." }, { status: 400 });
    }
    // Basic password validation (e.g., minimum length)
    if (password.length < 6) {
        console.warn("REGISTER_API: Password too short for email:", email);
        return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const db = await getDb();
    // Use the same collection name that your NextAuth.js MongoDBAdapter is configured to use for users.
    // From your nextauth_api_route Canvas, this is "users_auth".
    const usersCollection = db.collection<Omit<UserDocument, '_id'>>("users_auth"); 

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.warn("REGISTER_API: User already exists with email:", email.toLowerCase());
      return NextResponse.json({ message: "User with this email already exists." }, { status: 409 }); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12); // Salt rounds: 10-12 is typical

    // Create new user document
    // The MongoDBAdapter for NextAuth.js might expect specific fields or handle _id differently.
    // For a user created *outside* of NextAuth's direct adapter flow (like this registration endpoint),
    // we create a document that the adapter can later find and use.
    // NextAuth MongoDB adapter typically expects emailVerified to be a Date or null.
    const newUserDocument: Omit<UserDocument, '_id'> = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword, // Storing the hashed password
      role: "user" as UserRole, // Default role
      emailVerified: null, // Set to null initially; NextAuth can handle verification tokens if configured
      image: null, // Default profile image
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUserDocument);

    if (!result.insertedId) {
        console.error("REGISTER_API: Failed to insert new user into database for email:", email.toLowerCase());
        throw new Error("Failed to create user account due to a database error.");
    }

    console.log("REGISTER_API: New user registered successfully:", { id: result.insertedId, email: newUserDocument.email });
    // It's generally better not to automatically sign in the user here if using NextAuth's Credentials provider,
    // as that provider handles session creation upon successful login.
    // Redirect the user to the login page with a success message.
    return NextResponse.json({ message: "User registered successfully. Please log in." }, { status: 201 });

  } catch (error: unknown) {
    console.error("REGISTER_API: Error during registration:", error);
    const message = error instanceof Error ? error.message : "An internal server error occurred during registration.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
