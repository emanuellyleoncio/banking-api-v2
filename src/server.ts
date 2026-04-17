import { startTracer, shutdownTracer } from './lib/tracer';
startTracer();

import app from './app';
import logger from './lib/logger';

const PORT = process.env.PORT ?? 3000;

const server = app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

// graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await shutdownTracer();
  server.close(() => process.exit(0));
});
