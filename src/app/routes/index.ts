import express from "express";

import { UserRole } from "../../../generated/prisma/enums.js";
import authMiddleware from "../middlewares/authMiddleware.js";

import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import doctorRoutes from "../modules/doctor/doctor.routes.js";
import specialtyRoutes from "../modules/specialty/specialty.routes.js";
import patientRoutes from "../modules/patient/patient.routes.js";
import scheduleRoutes from "../modules/schedule/schedule.routes.js";
import doctorScheduleRoutes from "../modules/doctorSchedule/doctorSchedule.routes.js";

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
  {
    path: "/schedules",
    route: scheduleRoutes,
    middlewares: [
      // authMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    ],
  },
  {
    path: "/doctor-schedules",
    route: doctorScheduleRoutes,
    middlewares: [],
  },
];

moduleRoutes.forEach((moduleRoute) => {
  router.use(moduleRoute.path, ...moduleRoute.middlewares, moduleRoute.route);
});

export default router;
