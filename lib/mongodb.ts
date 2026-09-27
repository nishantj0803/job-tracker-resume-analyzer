// File: lib/mongodb.ts
// Lazy client: never throws at import time so `next build` / CI can
// collect page data without live secrets. getDb() throws a clear error
// only when a request actually needs the database.
import { MongoClient, Db, ServerApiVersion } from "mongodb";

const dbName = process.env.MONGODB_DB_NAME || "jobtrackr_db";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local. See .env.example."
    );
  }
  return uri;
}

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(getUri(), {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  return client.connect();
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }
    return global._mongoClientPromise;
  }
  return createClientPromise();
}

// Default export kept for @next-auth/mongodb-adapter. Exported as a
// thenable so the connection is only created when first awaited (per
// request), never at import/build time.
const lazyPromise = {
  then: (
    resolve: (client: MongoClient) => unknown,
    reject?: (err: unknown) => unknown
  ) => getClientPromise().then(resolve, reject),
  catch: (reject: (err: unknown) => unknown) =>
    getClientPromise().then((c) => c, reject),
  finally: (cb: () => void) =>
    getClientPromise()
      .then((c) => c)
      .finally(cb),
} as unknown as Promise<MongoClient>;

export async function getDb(): Promise<Db> {
  try {
    const connectedClient = await getClientPromise();
    return connectedClient.db(dbName);
  } catch (e) {
    throw new Error(
      "Failed to connect to the database. Please check your MONGODB_URI and network access settings in MongoDB Atlas."
    );
  }
}

export default lazyPromise;
