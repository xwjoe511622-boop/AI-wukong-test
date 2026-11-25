import 'server-only'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalDb = globalThis as unknown as { wukongPool?: Pool }
export const pool = globalDb.wukongPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})
if (process.env.NODE_ENV !== 'production') globalDb.wukongPool = pool
export const db = drizzle(pool, { schema })
