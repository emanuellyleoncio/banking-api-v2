import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod/v3";


type Source = 'body' | 'query' | 'params';

const validate = (schema: ZodSchema, source: Source = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req[source]) {
      res.status(400).json({ message: `Data source "${source}" not found in request.` });
      return;
    }

    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((e: any) => {
          const path = e.path.length > 0 ? `${e.path.join('.')}: ` : '';
          return `${path}${e.message}`;
        })
        .join(' | ');
        
      res.status(400).json({ message });
      return;
    }

    req[source] = result.data;

    next();
  };

export default validate;