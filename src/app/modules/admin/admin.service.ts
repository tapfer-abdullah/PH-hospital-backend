import { UserRole, UserStatus } from "../../../../generated/prisma/enums.ts";
import type { AdminWhereInput } from "../../../../generated/prisma/models.ts";
import { prisma } from "../../lib/prisma.ts";
import bcrypt from "bcrypt";
import { calculatePagination } from "../../utils/paginationHelper.ts";
import type { Admin } from "../../../../generated/prisma/client.ts";
import type { IAdminFilterRequest } from "./admin.interfaces.ts";
import type { IPaginationOptions } from "../../interfaces/pagination.ts";

export const createAdmin = async (data: any) => {
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

  return result;
};

export const getAdmins = async (
  searchQuery: IAdminFilterRequest,
  paginationQuery: IPaginationOptions
) => {
  const { search, ...otherFilters } = searchQuery || {};

  const { currentPage, limit, sortBy, sortOrder, skip } =
    calculatePagination(paginationQuery);

  let whereConditions: AdminWhereInput = {};
  const andConditions: AdminWhereInput[] = [];
  const searchableFields = ["name", "email"];

  //    {
  //       OR: [
  //         { name: { contains: search, mode: "insensitive" } },
  //         { email: { contains: search, mode: "insensitive" } },
  //       ],
  //     }

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

  const results = await prisma.admin.findMany({
    where: whereConditions,
    skip: skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalDocuments = await prisma.admin.count({ where: whereConditions });

  return {
    data: results,
    pagination: {
      totalDocuments,
      currentPage,
      limit,
    },
  };
};

export const getSingleAdmin = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id },
  });
  return admin;
};

export const updateAdmin = async (
  id: string,
  data: Partial<Admin>
): Promise<Admin | null> => {
  const isExist = await prisma.admin.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Admin not found");
  }

  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data,
  });
  return updatedAdmin;
};

export const deleteAdmin = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.$transaction(async (transaction) => {
    const admin = await transaction.admin.delete({
      where: { id },
    });

    const user = await transaction.user.delete({
      where: { email: admin.email },
    });

    return { admin, user };
  });
  return result.admin;
};

export const softDeleteAdmin = async (id: string): Promise<Admin | null> => {
  const isExist = await prisma.admin.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Admin not found");
  }

  const result = await prisma.$transaction(async (transaction) => {
    const deleteAdmin = await transaction.admin.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    const deleteUser = await transaction.user.update({
      where: {
        email: deleteAdmin.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return { deleteAdmin, deleteUser };
  });

  return result.deleteAdmin;
};
