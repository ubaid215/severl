// lib/prisma.ts
// Singleton Prisma client — prevents connection pool exhaustion in Next.js dev
// (Hot-reload creates a new module scope on every change; without this pattern
//  you'd leak a new PrismaClient on every HMR cycle.)

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']   // ← query logging enabled in dev (point 4)
        : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}