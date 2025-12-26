import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const port = envConfig.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "PH Server is running..",
    success: true,
  });
});

import allRoutes from "./app/routes/index.js";
import { extractReqInfo } from "./app/middlewares/extractReqInfo.js";
import globalErrorHandler from "./app/middlewares/globalErrorHandler.js";
import apiNotFound from "./app/middlewares/apiNotFound.js";
import envConfig from "./app/config/index.js";

// all routes
app.use("/api/v1", extractReqInfo, allRoutes);

app.use(globalErrorHandler);

app.use("/", apiNotFound);

export default app;
