import pino from 'pino';
import { env } from './env';

const isDev = env.NODE_ENV === 'development';
const isTest = env.NODE_ENV === 'test';

const logger = pino({
  level: isTest ? 'silent' : 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
});

export default logger;
