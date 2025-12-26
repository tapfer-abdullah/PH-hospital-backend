import type { ScheduleWhereInput } from "../../../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import { calculatePagination } from "../../utils/paginationHelper.js";
import type { IPaginationOptions } from "../../interfaces/pagination.js";
import type {
  IScheduleFilterRequest,
  ISchedulePayload,
} from "./schedule.interfaces.js";
import { scheduleSearchableFields } from "./schedule.constraint.js";
import type { IToken } from "../../interfaces/token.js";
import { UserRole } from "../../../../generated/prisma/enums.js";

function setTime(datetime: Date, time: string): Date {
  const newDate = new Date(datetime);
  const [hours, minutes, seconds = 0]: number[] = time.split(":").map(Number);
  newDate.setHours(hours as number, minutes, seconds, 0);
  return newDate;
}

export const createSchedule = async (data: ISchedulePayload) => {
  const { startDate, endDate, startingTime, endingTime, duration = 15 } = data;

  const scheduleSlots: { startDateTime: Date; endDateTime: Date }[] = [];

  //beginning time and date of a date
  const startingDate = new Date(`${startDate}T00:00:00`);
  const endingDate = new Date(`${endDate}T00:00:00`);
  let currentDate = new Date(startingDate);

  // loop for days
  while (currentDate <= endingDate) {
    const startingDateTime = setTime(currentDate, startingTime);
    const endingDateTime = setTime(currentDate, endingTime);
    let currentDateTime = new Date(startingDateTime);

    while (currentDateTime < endingDateTime) {
      const slotEndTime = new Date(
        currentDateTime.getTime() + duration * 60 * 1000
      ); // 15 min = 15 * 60 * 1000 ms

      if (slotEndTime > endingDateTime) {
        break;
      }
      scheduleSlots.push({
        startDateTime: new Date(currentDateTime),
        endDateTime: slotEndTime,
      });
      currentDateTime = slotEndTime;
    }

    // make staring of the date and ending date object of current date
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    currentDate = tomorrow;
  }

  // Simulate database operation
  const result = await prisma.$transaction(async (transaction) => {
    const createdSlots = [];
    for (const slot of scheduleSlots) {
      const existingSlot = await transaction.schedule.findFirst({
        where: {
          startDateTime: slot.startDateTime,
          endDateTime: slot.endDateTime,
        },
      });

      if (existingSlot) continue;

      const createdSlot = await transaction.schedule.create({
        data: {
          startDateTime: slot.startDateTime,
          endDateTime: slot.endDateTime,
        },
      });
      createdSlots.push(createdSlot);
    }

    return createdSlots;
  });

  return result;
};

export const getSchedules = async (
  doctor: IToken,
  searchQuery: IScheduleFilterRequest,
  paginationQuery: IPaginationOptions
) => {
  const { startDateTime, endDateTime } = searchQuery || {};

  const { currentPage, limit, sortBy, sortOrder, skip } = calculatePagination({
    ...paginationQuery,
    sortBy: paginationQuery.sortBy || "startDateTime",
    sortOrder: paginationQuery.sortOrder || "asc",
  });

  let whereConditions: ScheduleWhereInput = {};
  const andConditions: ScheduleWhereInput[] = [];

  if (startDateTime) {
    andConditions.push({
      startDateTime: { gte: new Date(startDateTime) },
    });
  }

  if (endDateTime) {
    andConditions.push({
      endDateTime: { lte: new Date(endDateTime) },
    });
  }

  if (doctor && doctor.role === UserRole.DOCTOR) {
    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
      where: { email: doctor.email },
    });

    const doctorSchedules = await prisma.doctorSchedules.findMany({
      where: { doctorId: doctorInfo.id },
    });

    const scheduleIds = doctorSchedules.map((ds) => ds.scheduleId);

    if (doctorInfo) {
      andConditions.push({
        id: {
          notIn: scheduleIds,
        },
      });
    }
  }

  if (andConditions.length > 0) {
    whereConditions.AND = andConditions;
  }

  const results = await prisma.schedule.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortBy
      ? { [sortBy]: sortOrder ? sortOrder : "asc" }
      : { startDateTime: "asc" },
  });

  const totalDocuments = await prisma.schedule.count({
    where: whereConditions,
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

// export const updateSchedule = async (
//   id: string,
//   req: Request
// ): Promise<Schedule | null> => {
//   const { specialties, ...data } = req.body.data;
//   const file = req.file;

//   if (file) {
//     const uploadedFileRes = await uploadImageToCloudinary(
//       file,
//       "AK-HealthCare/Schedules"
//     );

//     if (uploadedFileRes) {
//       data.profilePhoto = uploadedFileRes;
//     } else {
//       throw new Error("Failed to upload profile photo");
//     }
//   }

//   const isExist = await prisma.doctor.findUnique({
//     where: { id },
//   });

//   if (!isExist) {
//     throw new Error("Schedule not found");
//   }

//   const result = await prisma.$transaction(async (transaction) => {
//     if (specialties && specialties.length > 0) {
//       const reqForDelete = specialties.filter(
//         (s: any) => s.action === fieldUpdateOptions.DELETE
//       );
//       const reqForAdd = specialties.filter(
//         (s: any) => s.action === fieldUpdateOptions.ADD
//       );

//       if (reqForDelete.length > 0) {
//         for (const specialty of reqForDelete) {
//           await transaction.doctorSpecialty.deleteMany({
//             where: {
//               doctorId: id,
//               specialtyId: specialty.id,
//             },
//           });
//         }
//       }

//       if (reqForAdd.length > 0) {
//         for (const specialty of reqForAdd) {
//           await transaction.doctorSpecialty.create({
//             data: {
//               doctorId: id,
//               specialtyId: specialty.id,
//             },
//           });
//         }
//       }
//     }

//     await transaction.doctor.update({
//       where: { id },
//       data,
//     });
//   });

//   const updatedSchedule = await prisma.doctor.findUnique({
//     where: { id },
//     include: {
//       doctorSpecialties: {
//         include: { specialty: true },
//       },
//     },
//   });

//   return updatedSchedule;
// };

// export const deleteSchedule = async (id: string): Promise<Schedule | null> => {
//   await prisma.doctor.findUniqueOrThrow({
//     where: { id },
//   });

//   const result = await prisma.$transaction(async (transaction) => {
//     const doctor = await transaction.doctor.delete({
//       where: { id },
//     });

//     const user = await transaction.user.delete({
//       where: { email: doctor.email },
//     });

//     return { doctor, user };
//   });
//   return result.doctor;
// };

// export const softDeleteSchedule = async (
//   id: string
// ): Promise<Schedule | null> => {
//   const isExist = await prisma.doctor.findUnique({
//     where: { id },
//   });

//   if (!isExist) {
//     throw new Error("Schedule not found");
//   }

//   const result = await prisma.$transaction(async (transaction) => {
//     const deleteSchedule = await transaction.doctor.update({
//       where: {
//         id,
//       },
//       data: {
//         isDeleted: true,
//       },
//     });

//     const deleteUser = await transaction.user.update({
//       where: {
//         email: deleteSchedule.email,
//       },
//       data: {
//         status: UserStatus.DELETED,
//       },
//     });

//     return { deleteSchedule, deleteUser };
//   });

//   return result.deleteSchedule;
// };
