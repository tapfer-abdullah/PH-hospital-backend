import type { SpecialtyWhereInput } from "../../../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import { calculatePagination } from "../../utils/paginationHelper.js";
import type { Specialty } from "../../../../generated/prisma/client.js";
import type { IPaginationOptions } from "../../interfaces/pagination.js";
import type { Request } from "express";
import { uploadImageToCloudinary } from "../../utils/cloudinaryFileUploader.js";
import { specialtySearchableFields } from "./specialty.constraint.js";
import type { ISpecialtyFilterRequest } from "./specialty.interfaces.js";

export const createSpecialty = async (
  req: Request
): Promise<Specialty | null> => {
  const data = req.body.data;
  const file = req.file;

  if (file) {
    const uploadedFileRes = await uploadImageToCloudinary(
      file,
      "AK-HealthCare/Specialties"
    );

    if (uploadedFileRes) {
      data.icon = uploadedFileRes;
    } else {
      throw new Error("Failed to upload icon");
    }
  }

  const isExist = await prisma.specialty.findUnique({
    where: { title: data.title },
  });

  if (isExist) {
    throw new Error("Specialty already exists");
  }

  const result = await prisma.specialty.create({ data });
  return result;
};

export const getSpecialties = async (
  searchQuery: ISpecialtyFilterRequest,
  paginationQuery: IPaginationOptions
) => {
  const { search, ...otherFilters } = searchQuery || {};

  const { currentPage, limit, sortBy, sortOrder, skip } =
    calculatePagination(paginationQuery);

  let whereConditions: SpecialtyWhereInput = {};
  const andConditions: SpecialtyWhereInput[] = [];
  const searchableFields = specialtySearchableFields;

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

  const results = await prisma.specialty.findMany({
    where: whereConditions,
    skip: skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalDocuments = await prisma.specialty.count({
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

export const getSingleSpecialty = async (id: string) => {
  const result = await prisma.specialty.findUnique({
    where: { id },
  });
  return result;
};

export const updateSpecialty = async (
  id: string,
  req: Request
): Promise<Specialty | null> => {
  const data = req.body.data;
  const file = req.file;

  if (file) {
    const uploadedFileRes = await uploadImageToCloudinary(
      file,
      "AK-HealthCare/Specialties"
    );

    if (uploadedFileRes) {
      data.icon = uploadedFileRes;
    } else {
      throw new Error("Failed to upload icon");
    }
  }

  const isExist = await prisma.specialty.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Specialty not found");
  }

  const updatedSpecialty = await prisma.specialty.update({
    where: { id },
    data,
  });
  return updatedSpecialty;
};

export const deleteSpecialty = async (
  id: string
): Promise<Specialty | null> => {
  await prisma.specialty.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.specialty.delete({
    where: { id },
  });

  return result;
};
