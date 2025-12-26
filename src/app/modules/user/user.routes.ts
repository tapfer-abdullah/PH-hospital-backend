import express from "express";
import * as controllerFile from "./user.controller.js";

const route = express.Router();

route.post("/", controllerFile.createUser);
route.get("/", controllerFile.getUsers);
route.get("/old", controllerFile.getUser);

export default route;
