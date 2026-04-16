import 'dotenv/config';
import express from 'express';
import errorHandler from './middleware/errorHandler';

import routes from './routes/index'
import logger from './lib/logger';

const app = express();
app.use(express.json());

app.use('/contas', routes);


app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});