import { Router } from 'express';
import adminAuth from '../middleware/adminAuth';
import authMiddleware from '../middleware/authMiddleware';
import { accountController } from '../controllers/accountController';
import { updateAccountSchema } from '../schemas';
import validate from '../middleware/validate';


const accountRouter = Router();

accountRouter.get('/', adminAuth, accountController.list);
accountRouter.put('/:number', authMiddleware, validate(updateAccountSchema), accountController.update);
accountRouter.delete('/:number', authMiddleware, accountController.remove);

export default accountRouter;
