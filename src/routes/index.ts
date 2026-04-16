import { Router } from "express";
const router = Router()

import accountRouter from "./account";
import authRouter from "./auth";

router.use('/account', accountRouter);
router.use('/auth', authRouter);

module.exports = router;
