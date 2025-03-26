import * as schema from "@/db/schema";
import env from "@/lib/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema, logger: true });
export type DB = typeof db;
