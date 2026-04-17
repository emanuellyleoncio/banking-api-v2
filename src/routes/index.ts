import { Router } from "express";
const router = Router()

import accountRouter from "./account";
import authRouter from "./auth";
import transactionRouter from "./transaction";

router.use('/accounts', accountRouter);
router.use('/auth', authRouter);
router.use('/transactions', transactionRouter);

export default router;
