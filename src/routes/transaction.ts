import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import validate from '../middleware/validate';
import { depositSchema, transferSchema, withdrawalSchema,  } from '../schemas';
import { transactionController } from '../controllers/transactionController';


const transactionRouter = Router();

transactionRouter.use(authMiddleware)

transactionRouter.post('/deposit', validate(depositSchema), transactionController.deposit);
transactionRouter.post('/withdraw', validate(withdrawalSchema), transactionController.withdraw);
transactionRouter.post('/transfer', validate(transferSchema), transactionController.transfer);
transactionRouter.get('/balance', transactionController.balance);
transactionRouter.get('/statement', transactionController.statement);

export default transactionRouter;
