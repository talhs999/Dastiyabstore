import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Automatically load .env.production or .env if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const prodEnvPath = path.resolve(process.cwd(), '.env.production');
  if (fs.existsSync(prodEnvPath)) {
    dotenv.config({ path: prodEnvPath });
  } else {
    dotenv.config();
  }
}

// Ensure database URL has connection pool limits to prevent Hostinger MySQL exhaustion during traffic spikes
function getSafeDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  
  // If connection_limit is not specified in query params, safely attach connection tuning
  if (!url.includes('connection_limit=')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}connection_limit=7&pool_timeout=15&connect_timeout=10`;
  }
  return url;
}

const safeDbUrl = getSafeDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(
    safeDbUrl
      ? {
          datasources: {
            db: {
              url: safeDbUrl,
            },
          },
        }
      : undefined
  );

// Always store on globalThis so all requests reuse the single connection pool
globalForPrisma.prisma = prisma;
