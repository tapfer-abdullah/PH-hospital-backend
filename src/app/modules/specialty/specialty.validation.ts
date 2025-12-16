import { z } from "zod";

// 1) Define fields once
const specialtyBodyBase = z.object({
  title: z.string().min(3, "Name is required."),
  icon: z.string().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
  description: z.string().nullable().optional(),
});

// 2) Create: require all non-optional keys
const create = z.object({
  body: specialtyBodyBase,
});

// 3) Update: allow partial updates (everything optional)
const update = z.object({
  body: specialtyBodyBase.partial(),
});

export const specialtyValidationSchemas = {
  create,
  update,
};
