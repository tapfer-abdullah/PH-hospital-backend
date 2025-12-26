import { UserRole } from "../../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import type { IUserFilterRequest } from "./user.interfaces.js";
import type { IPaginationOptions } from "../../interfaces/pagination.js";
import { calculatePagination } from "../../utils/paginationHelper.js";
import type { UserWhereInput } from "../../../../generated/prisma/models.js";
import { userSearchableFields } from "./user.constraint.js";

export const createUser = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const userData = {
    // name: data.admin.name,
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  // Simulate database operation
  const result = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({ data: userData });

    const admin = await transaction.admin.create({
      data: data.admin,
    });

    return { user, admin };
  });

  return { id: 1, message: "User created successfully", result };
};

export const getUser = async () => {
  const results = await prisma.user.findMany();
  return { id: 1, message: "User created successfully", results };
};

export const getUsers = async (
  searchQuery: IUserFilterRequest,
  paginationQuery: IPaginationOptions
) => {
  const { search, ...otherFilters } = searchQuery || {};

  const { currentPage, limit, sortBy, sortOrder, skip } =
    calculatePagination(paginationQuery);

  let whereConditions: UserWhereInput = {};
  const andConditions: UserWhereInput[] = [];

  // filter by search term
  if (search) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
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

  const results = await prisma.user.findMany({
    where: whereConditions,
    skip: skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      doctor: {
        select: {
          name: true,
        },
      },
    },
  });

  const totalDocuments = await prisma.user.count({ where: whereConditions });

  return {
    data: results,
    pagination: {
      totalDocuments,
      currentPage,
      limit,
    },
  };
};
