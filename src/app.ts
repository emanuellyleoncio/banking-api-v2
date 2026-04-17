import 'dotenv/config';
import express from 'express';
import errorHandler from './middleware/errorHandler';
import router from './routes/index';
import { setupSwagger } from './lib/swagger';
import { setupSecurity } from './middleware/securityActions';

const app = express();
app.use(express.json());
setupSecurity(app);

app.use('/api', router);

setupSwagger(app);

app.use(errorHandler);

export default app;
