import type { Request, Response } from "express";
import * as serviceFile from "./user.service.ts";

export const createUser = async (req: Request, res: Response) => {
  const data = req.body;
  const result = await serviceFile.createUser(data);

  return res.json(result);
};

export const getUser = async (req: Request, res: Response) => {
  const result = await serviceFile.getUser();
  return res.json(result);
};
