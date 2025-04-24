import { defineConfig } from "drizzle-kit";
import { join } from "path";

export default defineConfig({
  out: "./db/migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
  verbose: true,
});
