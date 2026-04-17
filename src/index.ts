import 'dotenv/config';
import express from 'express';
import errorHandler from './middleware/errorHandler';


import logger from './lib/logger';
import router from './routes/index';

const app = express();
app.use(express.json());

app.use('/api', router);


app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});