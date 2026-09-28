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

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(
    process.env.DATABASE_URL
      ? {
          datasources: {
            db: {
              url: process.env.DATABASE_URL,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
