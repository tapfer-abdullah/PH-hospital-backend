import { UserRole, UserStatus } from "../../../../generated/prisma/enums.ts";
import { prisma } from "../../lib/prisma.ts";
import bcrypt from "bcrypt";
import { calculatePagination } from "../../utils/paginationHelper.ts";
import type { Patient } from "../../../../generated/prisma/client.ts";
import type { IPaginationOptions } from "../../interfaces/pagination.ts";
import type { Request } from "express";
import {
  deleteFromCloudinary,
  getCloudinaryPublicId,
  uploadImageToCloudinary,
} from "../../utils/cloudinaryFileUploader.ts";
import envConfig from "../../config/index.ts";
import { fieldUpdateOptions } from "../../constraint/action.ts";
import type { IPatientsFilterRequest } from "./patient.interfaces.ts";
import type { PatientWhereInput } from "../../../../generated/prisma/models.ts";
import { patientsSearchableFields } from "./patient.constraint.ts";
import cloudinaryDirectory from "../../config/cloudinaryDirectory.ts";

export const createPatient = async (data: any) => {
  const hashedPassword = await bcrypt.hash(
    data.password,
    envConfig.BCRYPT_SALT_ROUNDS
  );
  const userData = {
    email: data.data.email,
    password: hashedPassword,
    role: UserRole.PATIENTS,
  };

  // Simulate database operation
  const result = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({ data: userData });

    const patient = await transaction.patient.create({
      data: data.data,
    });

    return { user, patient };
  });

  return result;
};

export const getPatients = async (
  searchQuery: IPatientsFilterRequest,
  paginationQuery: IPaginationOptions
) => {
  const { search, ...otherFilters } = searchQuery || {};

  const { currentPage, limit, sortBy, sortOrder, skip } =
    calculatePagination(paginationQuery);

  let whereConditions: PatientWhereInput = {};
  const andConditions: PatientWhereInput[] = [];
  const searchableFields = patientsSearchableFields;

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

  const results = await prisma.patient.findMany({
    where: whereConditions,
    skip: skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: {
        select: { email: true, role: true, status: true },
      },
    },
  });

  const totalDocuments = await prisma.patient.count({ where: whereConditions });

  return {
    data: results,
    pagination: {
      totalDocuments,
      currentPage,
      limit,
    },
  };
};

export const getSinglePatient = async (id: string) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, role: true, status: true } },
      patientHealthData: true,
      medicalReports: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return patient;
};

export const updatePatient = async (
  id: string,
  req: Request
): Promise<
  (Patient & { patientHealthData: any; medicalReports: any[] }) | null
> => {
  let { healthRecords, medicalReport, ...data } = req.body.data;

  const isExist = await prisma.patient.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Patient not found");
  }

  const profilePhoto =
    req.files && (req.files as any)["profilePhoto"]
      ? (req.files as any)["profilePhoto"][0]
      : null;

  const medicalReportFiles =
    req.files && (req.files as any)["medicalReports"]
      ? (req.files as any)["medicalReports"]
      : null;

  if (profilePhoto) {
    // delete profilePhoto if exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
      select: { profilePhoto: true },
    });

    if (existingPatient?.profilePhoto) {
      const publicId = getCloudinaryPublicId(existingPatient.profilePhoto);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    const uploadedFileRes = await uploadImageToCloudinary(
      profilePhoto,
      cloudinaryDirectory.PATIENT_PROFILE_PHOTOS
    );

    if (uploadedFileRes) {
      data.profilePhoto = uploadedFileRes;
    } else {
      throw new Error("Failed to upload profile photo");
    }
  }

  if (medicalReportFiles && medicalReportFiles.length > 0) {
    if (!medicalReport) {
      medicalReport = [];
    }

    for (let i = 0; i < medicalReportFiles.length; i++) {
      const uploadedReportRes = await uploadImageToCloudinary(
        medicalReportFiles[i],
        cloudinaryDirectory.PATIENT_MEDICAL_REPORTS
      );

      if (uploadedReportRes) {
        if (!medicalReport[i]) {
          medicalReport[i] = {
            reportName: medicalReportFiles[i].originalname.split(".")[0],
          };
        }

        medicalReport[i].reportLink = uploadedReportRes;
      }
    }
  }

  let result = null;
  if (
    healthRecords &&
    Object.keys(healthRecords).length > 0 &&
    medicalReport &&
    medicalReport.length > 0
  ) {
    result = await prisma.$transaction(async (transaction) => {
      const updatedPatient = await transaction.patient.update({
        where: {
          id,
        },
        data: {
          ...data,
        },
      });

      const updatedHealthRecords = await transaction.patientHealthData.upsert({
        where: { patientId: id },
        create: {
          patientId: id,
          ...healthRecords,
        },
        update: {
          ...healthRecords,
        },
      });

      const uploadedMedicalReports = [];
      for (const report of medicalReport) {
        const updatedReport = await transaction.medicalReport.create({
          data: {
            patientId: id,
            ...report,
          },
        });

        uploadedMedicalReports.push(updatedReport);
      }
      return { updatedPatient, updatedHealthRecords, uploadedMedicalReports };
    });
  }

  return {
    ...result?.updatedPatient,
    patientHealthData: result?.updatedHealthRecords,
    medicalReports: result?.uploadedMedicalReports
      ? result.uploadedMedicalReports
      : [],
  };
};

export const deletePatient = async (id: string): Promise<Patient | null> => {
  await prisma.patient.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.$transaction(async (transaction) => {
    //TODO: handle delete cloudinary files

    await transaction.patientHealthData.delete({
      where: { patientId: id },
    });

    await transaction.medicalReport.deleteMany({
      where: { patientId: id },
    });

    await transaction.appointment.deleteMany({
      where: { patientId: id },
    });

    await transaction.prescription.deleteMany({
      where: { patientId: id },
    });

    const patient = await transaction.patient.delete({
      where: { id },
    });

    const user = await transaction.user.delete({
      where: { email: patient.email },
    });

    return { patient, user };
  });
  return result.patient;
};

export const softDeletePatient = async (
  id: string
): Promise<Patient | null> => {
  const isExist = await prisma.patient.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Patient not found");
  }

  const result = await prisma.$transaction(async (transaction) => {
    const deletePatient = await transaction.patient.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    const deleteUser = await transaction.user.update({
      where: {
        email: deletePatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return { deletePatient, deleteUser };
  });

  return result.deletePatient;
};
