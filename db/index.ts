import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required to connect to Dr Mars PostgreSQL.");
  db ??= drizzle(postgres(connectionString, { prepare: false, max: 10 }), { schema });
  return db;
}
