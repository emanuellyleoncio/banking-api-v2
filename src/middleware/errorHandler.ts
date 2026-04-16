import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors";
import logger from "../lib/logger";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ mensagem: err.message });
    return;
  }
  logger.error({ err }, 'Erro inesperado');
  res.status(500).json({ mensagem: 'Erro interno do servidor.' });
};

export default errorHandler;
