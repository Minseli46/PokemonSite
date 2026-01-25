/**
 * Configuration du serveur
 */
export const serverConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  apiPrefix: '/api',
};

export default serverConfig;
