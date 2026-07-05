import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';


const connectionString = process.env.SUPABASE_URL;

if (!connectionString) {
  throw new Error("SUPABASE_URL is not defined in environment variables!");
}


const client = postgres(connectionString, { prepare: false }) as any;

export const db = drizzle(client, { schema });
