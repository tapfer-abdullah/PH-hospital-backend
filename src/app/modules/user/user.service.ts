import { UserRole } from "../../../../generated/prisma/enums.ts";
import { prisma } from "../../lib/prisma.ts";
import bcrypt from "bcrypt";

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
