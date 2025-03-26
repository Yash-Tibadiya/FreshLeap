import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

// Create the Neon SQL client
const sql = neon(process.env.DATABASE_URL!);

// Set up the Drizzle ORM instance with the query builder
export const db = drizzle(sql);
