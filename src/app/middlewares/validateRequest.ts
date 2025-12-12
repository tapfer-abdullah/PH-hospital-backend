import { type NextFunction, type Request, type Response } from "express";
import type { z } from "zod";

const validateRequest =
  (schema: z.ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };

export default validateRequest;
