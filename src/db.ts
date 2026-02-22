import { MongoClient, Db, Collection } from "mongodb";
import type { Venture, VentureModel, SimRun } from "./types";

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in."
    );
  }

  client = new MongoClient(uri, {
    connectTimeoutMS: 10_000,
    serverSelectionTimeoutMS: 10_000,
  });
  await client.connect();

  // Extract db name from URI path, env var, or default
  const dbName =
    process.env.MONGODB_DB_NAME ||
    (() => {
      try {
        const u = new URL(uri);
        const name = u.pathname.replace(/^\//, "").split("?")[0];
        return name || "cognitive-twin";
      } catch {
        return "cognitive-twin";
      }
    })();

  db = client.db(dbName);
  console.log(`[db] connected — database: "${dbName}"`);
  return db;
}

export function getDB(): Db {
  if (!db) throw new Error("DB not initialised — call connectDB() first");
  return db;
}

// Typed collection helpers
export function ventures(): Collection<Venture> {
  return getDB().collection<Venture>("ventures");
}
export function ventureModels(): Collection<VentureModel> {
  return getDB().collection<VentureModel>("ventureModels");
}
export function simRuns(): Collection<SimRun> {
  return getDB().collection<SimRun>("simRuns");
}
