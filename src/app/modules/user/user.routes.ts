import express from "express";
import * as controllerFile from "./user.controller.ts";

const route = express.Router();

route.post("/", controllerFile.createUser);
route.get("/", controllerFile.getUser);

export default route;
