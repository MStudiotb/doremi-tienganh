import { MongoClient, ServerApiVersion } from "mongodb";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

export function getMongoClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("MONGODB_URI is missing. Running in Local Mode.");
    return null;
  }

  if (clientPromise) {
    return clientPromise;
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalForMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalForMongo._mongoClientPromise = client.connect();
    }

    clientPromise = globalForMongo._mongoClientPromise;

    return clientPromise;
  }

  client = new MongoClient(uri, options);
  clientPromise = client.connect();

  return clientPromise;
}
