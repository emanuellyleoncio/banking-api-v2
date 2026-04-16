import { Router } from 'express';
import { loginSchema, registerSchema } from '../schemas';
import {authController} from '../controllers/authController';
import validate from '../middleware/validate';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);

export default authRouter;
