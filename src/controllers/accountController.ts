import type { Request, Response, NextFunction } from 'express';
import { accountService } from '../services/accountService';


export const accountController = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await accountService.list();
            res.json(result);
        } catch (error) { 
            next(error); 
        }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await accountService.update(req.account.id, req.body);
            res.json(result);
        } catch (error) { 
            next(error); 
        }
    },

    remove: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await accountService.remove(req.account.id);
            res.status(204).send();
        } catch (error) { 
            next(error); 
        }
    },
};
