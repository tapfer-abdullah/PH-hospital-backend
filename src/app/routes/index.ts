import express from "express";
import adminRoutes from "../modules/admin/admin.routes.ts";
import userRoutes from "../modules/user/user.routes.ts";
import authRoutes from "../modules/auth/auth.routes.ts";
import { UserRole } from "../../../generated/prisma/enums.ts";
import authMiddleware from "../middlewares/authMiddleware.ts";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/admin",
    route: adminRoutes,
    middlewares: [authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN)],
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
