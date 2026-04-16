import { Router } from "express";
import adminAuth from "../middleware/adminAuth";

const router = Router()

router.get('/', adminAuth, (request, response) => {
    response.json({message: 'ok rota'})
})

export default router