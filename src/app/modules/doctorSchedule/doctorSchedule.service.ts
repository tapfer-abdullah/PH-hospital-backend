import type { ScheduleWhereInput } from "../../../../generated/prisma/models.ts";
import { prisma } from "../../lib/prisma.ts";
import { calculatePagination } from "../../utils/paginationHelper.ts";
import type { IPaginationOptions } from "../../interfaces/pagination.ts";
import type { IToken } from "../../interfaces/token.ts";
import type { IDoctorScheduleFilterRequest } from "./doctorSchedule.interfaces.ts";
import { UserRole } from "../../../../generated/prisma/enums.ts";
import type { DoctorSchedules } from "../../../../generated/prisma/client.ts";
import ApiError from "../../utils/ApiError.ts";
import { StatusCodes } from "http-status-codes";

function setTime(datetime: Date, time: string): Date {
  const newDate = new Date(datetime);
  const [hours, minutes, seconds = 0]: number[] = time.split(":").map(Number);
  newDate.setHours(hours as number, minutes, seconds, 0);
  return newDate;
}

export const createSchedule = async (doctor: any, data: string[]) => {
  const isDoctorExist = await prisma.doctor.findUniqueOrThrow({
    where: { email: doctor.email },
  });

  const scheduleSlots: { doctorId: string; scheduleId: string }[] = data.map(
    (slotId) => ({
      doctorId: isDoctorExist.id,
      scheduleId: slotId,
    })
  );

  const result = await prisma.doctorSchedules.createMany({
    data: scheduleSlots,
  });

  return result;
};

export const getMySchedules = async (
  doctor: IToken,
  searchQuery: IDoctorScheduleFilterRequest,
  paginationQuery: IPaginationOptions
) => {
  const { startDateTime, endDateTime, isBooked } = searchQuery || {};

  const { currentPage, limit, sortBy, sortOrder, skip } = calculatePagination({
    ...paginationQuery,
    sortBy: paginationQuery.sortBy || "startDateTime",
    sortOrder: paginationQuery.sortOrder || "asc",
  });

  let whereConditions: any = {};

  if (isBooked !== undefined && (isBooked === "true" || isBooked === "false")) {
    whereConditions.isBooked = isBooked === "true" ? true : false;
  }

  if (startDateTime && endDateTime) {
    whereConditions.schedule = {
      startDateTime: {
        gte: startDateTime,
      },
      endDateTime: {
        lte: endDateTime,
      },
    };
  }

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: { email: doctor.email },
  });

  const results = await prisma.doctorSchedules.findMany({
    where: {
      doctorId: doctorInfo.id,
      ...whereConditions,
    },
    skip,
    take: limit,
    select: {
      schedule: true,
      isBooked: true,
    },
  });

  const totalDocuments = await prisma.doctorSchedules.count({
    where: {
      doctorId: doctorInfo.id,
      ...whereConditions,
    },
  });

  return {
    data: results,
    pagination: {
      totalDocuments,
      currentPage,
      limit,
    },
  };
};

// export const getSingleSchedule = async (id: string) => {
//   const doctor = await prisma.doctor.findUnique({
//     where: { id },
//     include: {
//       doctorSpecialties: {
//         include: { specialty: true },
//       },
//       user: { select: { email: true, role: true, status: true } },
//     },
//   });
//   return doctor;
// };

export const deleteSchedule = async (
  id: string,
  doctor: IToken
): Promise<DoctorSchedules | null> => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: { email: doctor.email },
  });

  const isScheduleBooked = await prisma.doctorSchedules.findFirst({
    where: {
      scheduleId: id,
      doctorId: doctorInfo.id,
      isBooked: true,
    },
  });

  if (isScheduleBooked) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Cannot delete a booked schedule"
    );
  }

  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorInfo.id,
        scheduleId: id,
      },
    },
  });

  return result;
};
