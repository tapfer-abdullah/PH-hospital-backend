import express from "express";
import adminRoutes from "../modules/admin/admin.routes.ts";
import userRoutes from "../modules/user/user.routes.ts";
import authRoutes from "../modules/auth/auth.routes.ts";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/admin",
    route: adminRoutes,
    middlewares: [],
  },
  {
    path: "/user",
    route: userRoutes,
    middlewares: [],
  },
  {
    path: "/auth",
    route: authRoutes,
    middlewares: [],
  },
];

moduleRoutes.forEach((moduleRoute) => {
  router.use(moduleRoute.path, ...moduleRoute.middlewares, moduleRoute.route);
});

export default router;
