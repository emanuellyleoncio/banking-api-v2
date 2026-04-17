import type { NextFunction, Request, Response } from "express";
import { transactionService } from "../services/transactionService";

export const transactionController = {

    deposit: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.deposit(req.account.id, req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    },

    withdraw: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.withdraw(req.account.id, req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    },

    transfer: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.transfer(req.account.id, req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    },

    balance: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.balance(req.account.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    statement: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.statement(req.account.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
