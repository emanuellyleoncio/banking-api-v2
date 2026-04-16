import type { Request, Response, NextFunction } from 'express';
import { accountService } from '../services/accountService';


export const accountController = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await accountService.list();
            res.json(result);
        } catch (err) { 
            next(err); 
        }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await accountService.update(req.account.id, req.body);
            res.json(result);
        } catch (err) { 
            next(err); 
        }
    },

    remove: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await accountService.remove(req.account.id);
            res.status(204).send();
        } catch (err) { 
            next(err); 
        }
    },
};
