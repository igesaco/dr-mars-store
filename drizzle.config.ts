import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL ?? "";
if (process.argv.includes("migrate") && (!databaseUrl || new URL(databaseUrl).pathname !== "/dr_mars")) {
  throw new Error("Migration blocked: DATABASE_URL must point to dr_mars.");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
});
