import { PrismaClient } from '@prisma/client';

/**
 * Configuration de la base de données
 */
export const prismaConfig = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] as const : ['error'] as const,
};

/**
 * Instance Prisma partagée
 */
let prisma: PrismaClient;

/**
 * Obtient ou crée l'instance Prisma
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient(prismaConfig);
  }
  return prisma;
}

/**
 * Déconnecte la base de données
 */
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

export default getPrismaClient;
