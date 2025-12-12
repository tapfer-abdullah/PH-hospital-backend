import express from "express";
import * as controllerFile from "./auth.controller.ts";

const router = express.Router();

router.post("/refresh-token", controllerFile.refreshToken);
router.post("/login", controllerFile.login);

export default router;
