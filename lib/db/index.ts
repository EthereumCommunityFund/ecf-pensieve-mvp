import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client);

export * from './schema';
