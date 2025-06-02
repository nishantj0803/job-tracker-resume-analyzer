// File: lib/mongodb.ts
import { MongoClient, Db, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'jobtrackr_db'; // Fallback DB name

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local. Make sure your MongoDB connection string is correctly set.'
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Extend the NodeJS.Global interface to declare the _mongoClientPromise property
// This is to satisfy TypeScript when using a global variable in development.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log("MONGODB_CLIENT: Creating new MongoDB client connection promise (development).");
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
  });
  console.log("MONGODB_CLIENT: Creating new MongoDB client connection promise (production).");
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
// And an async function to get the database instance.
export async function getDb(): Promise<Db> {
  try {
    const connectedClient = await clientPromise;
    const database = connectedClient.db(dbName);
    // console.log("MONGODB_CLIENT: Successfully connected to database:", database.databaseName); // Reduce noise, log on first connect in dev
    return database;
  } catch (e) {
    console.error("MONGODB_CLIENT: Failed to connect to MongoDB", e);
    throw new Error("Failed to connect to the database. Please check your MONGODB_URI and network access settings in MongoDB Atlas.");
  }
}

// Export clientPromise if direct client access is needed, though getDb() is usually preferred.
export default clientPromise;
