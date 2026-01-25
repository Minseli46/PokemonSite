/**
 * Point d'entrée centralisé pour toutes les configurations
 */
export { getPrismaClient, disconnectDatabase, prismaConfig } from './database';
export { corsConfig } from './cors';
export { serverConfig } from './server';
