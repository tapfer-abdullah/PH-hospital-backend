import express from "express";

import { UserRole } from "../../../generated/prisma/enums.ts";
import authMiddleware from "../middlewares/authMiddleware.ts";

import authRoutes from "../modules/auth/auth.routes.ts";
import userRoutes from "../modules/user/user.routes.ts";
import adminRoutes from "../modules/admin/admin.routes.ts";
import doctorRoutes from "../modules/doctor/doctor.routes.ts";
import specialtyRoutes from "../modules/specialty/specialty.routes.ts";
import patientRoutes from "../modules/patient/patient.routes.ts";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
    middlewares: [],
  },
  {
    path: "/users",
    route: userRoutes,
    middlewares: [],
  },
  {
    path: "/admins",
    route: adminRoutes,
    middlewares: [authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN)],
  },
  {
    path: "/doctors",
    route: doctorRoutes,
    middlewares: [],
  },
  {
    path: "/patients",
    route: patientRoutes,
    middlewares: [],
  },
  {
    path: "/specialties",
    route: specialtyRoutes,
    middlewares: [],
  },
];

moduleRoutes.forEach((moduleRoute) => {
  router.use(moduleRoute.path, ...moduleRoute.middlewares, moduleRoute.route);
});

export default router;
