import app from './app';
import databaseService from './services/databaseService';
import { serverConfig, disconnectDatabase } from './config';

/**
 * Démarre le serveur
 */
async function startServer() {
  try {
    // Connecte à la base de données
    await databaseService.connect();

    // Démarre le serveur HTTP
    app.listen(serverConfig.port, () => {
      console.log(`🚀 Server is running on port ${serverConfig.port}`);
      console.log(`📍 http://localhost:${serverConfig.port}`);
      console.log(`🏥 Health check: http://localhost:${serverConfig.port}/health`);
      console.log(`📚 API Docs: http://localhost:${serverConfig.port}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Gestion de l'arrêt gracieux
 */
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseService.disconnect();
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseService.disconnect();
  await disconnectDatabase();
  process.exit(0);
});

// Démarre le serveur
startServer();
