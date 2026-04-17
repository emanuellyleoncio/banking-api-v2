import 'dotenv/config';
import express from 'express';
import errorHandler from './middleware/errorHandler';
import router from './routes/index';

const app = express();
app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

export default app;
