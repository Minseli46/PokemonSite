import app from './app';
import databaseService from './services/databaseService';

const PORT = process.env.PORT || 3000;

/**
 * Démarre le serveur
 */
async function startServer() {
  try {
    // Connecte à la base de données
    await databaseService.connect();

    // Démarre le serveur HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
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
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseService.disconnect();
  process.exit(0);
});

// Démarre le serveur
startServer();
