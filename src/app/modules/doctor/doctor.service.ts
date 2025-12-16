import { UserRole, UserStatus } from "../../../../generated/prisma/enums.ts";
import type { DoctorWhereInput } from "../../../../generated/prisma/models.ts";
import { prisma } from "../../lib/prisma.ts";
import bcrypt from "bcrypt";
import { calculatePagination } from "../../utils/paginationHelper.ts";
import type { Doctor } from "../../../../generated/prisma/client.ts";
import type { IPaginationOptions } from "../../interfaces/pagination.ts";
import type { Request } from "express";
import { uploadImageToCloudinary } from "../../utils/cloudinaryFileUploader.ts";
import envConfig from "../../config/index.ts";
import type { IDoctorFilterRequest } from "./doctor.interfaces.ts";
import { fieldUpdateOptions } from "../../constraint/action.ts";

export const createDoctor = async (data: any) => {
  const hashedPassword = await bcrypt.hash(
    data.password,
    envConfig.BCRYPT_SALT_ROUNDS
  );
  const userData = {
    email: data.data.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  // Simulate database operation
  const result = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({ data: userData });

    const doctor = await transaction.doctor.create({
      data: data.data,
    });

    return { user, doctor };
  });

  return result;
};

export const getDoctors = async (
  searchQuery: IDoctorFilterRequest,
  paginationQuery: IPaginationOptions
) => {
  const { search, ...otherFilters } = searchQuery || {};

  const { currentPage, limit, sortBy, sortOrder, skip } =
    calculatePagination(paginationQuery);

  let whereConditions: DoctorWhereInput = {};
  const andConditions: DoctorWhereInput[] = [];
  const searchableFields = ["name", "email", "currentWorkplace"];

  // filter by search term
  if (search) {
    andConditions.push({
      OR: searchableFields.map((field) => ({
        [field]: { contains: search, mode: "insensitive" },
      })),
    });
  }

  // Exact match filters
  if (Object.keys(otherFilters).length) {
    andConditions.push({
      OR: Object.entries(otherFilters).map(([field, value]) => ({
        [field]: { equals: value },
      })),
    });
  }

  if (andConditions.length > 0) {
    whereConditions.AND = andConditions;
  }

  const results = await prisma.doctor.findMany({
    where: whereConditions,
    skip: skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalDocuments = await prisma.doctor.count({ where: whereConditions });

  return {
    data: results,
    pagination: {
      totalDocuments,
      currentPage,
      limit,
    },
  };
};

export const getSingleDoctor = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      doctorSpecialties: {
        include: { specialty: true },
      },
      user: { select: { email: true, role: true, status: true } },
    },
  });
  return doctor;
};

export const updateDoctor = async (
  id: string,
  req: Request
): Promise<Doctor | null> => {
  const { specialties, ...data } = req.body.data;
  const file = req.file;

  if (file) {
    const uploadedFileRes = await uploadImageToCloudinary(
      file,
      "AK-HealthCare/Doctors"
    );

    if (uploadedFileRes) {
      data.profilePhoto = uploadedFileRes;
    } else {
      throw new Error("Failed to upload profile photo");
    }
  }

  const isExist = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Doctor not found");
  }

  const result = await prisma.$transaction(async (transaction) => {
    if (specialties && specialties.length > 0) {
      const reqForDelete = specialties.filter(
        (s: any) => s.action === fieldUpdateOptions.DELETE
      );
      const reqForAdd = specialties.filter(
        (s: any) => s.action === fieldUpdateOptions.ADD
      );

      if (reqForDelete.length > 0) {
        for (const specialty of reqForDelete) {
          await transaction.doctorSpecialty.deleteMany({
            where: {
              doctorId: id,
              specialtyId: specialty.id,
            },
          });
        }
      }

      if (reqForAdd.length > 0) {
        for (const specialty of reqForAdd) {
          await transaction.doctorSpecialty.create({
            data: {
              doctorId: id,
              specialtyId: specialty.id,
            },
          });
        }
      }
    }

    await transaction.doctor.update({
      where: { id },
      data,
    });
  });

  const updatedDoctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      doctorSpecialties: {
        include: { specialty: true },
      },
    },
  });

  return updatedDoctor;
};

export const deleteDoctor = async (id: string): Promise<Doctor | null> => {
  await prisma.doctor.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.$transaction(async (transaction) => {
    const doctor = await transaction.doctor.delete({
      where: { id },
    });

    const user = await transaction.user.delete({
      where: { email: doctor.email },
    });

    return { doctor, user };
  });
  return result.doctor;
};

export const softDeleteDoctor = async (id: string): Promise<Doctor | null> => {
  const isExist = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Doctor not found");
  }

  const result = await prisma.$transaction(async (transaction) => {
    const deleteDoctor = await transaction.doctor.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    const deleteUser = await transaction.user.update({
      where: {
        email: deleteDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return { deleteDoctor, deleteUser };
  });

  return result.deleteDoctor;
};
