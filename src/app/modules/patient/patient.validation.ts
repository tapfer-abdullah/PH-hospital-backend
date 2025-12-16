import { email, z } from "zod";

const patientsBodyBase = z.object({
  name: z.string().min(3, "Name is required."),
  email: z.string().email("Invalid email address."),
  contactNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  isDeleted: z.boolean().nullable().optional(),
});

const create = z.object({
  body: patientsBodyBase,
});

const update = z.object({
  body: patientsBodyBase.partial(),
});

export const patientsValidationSchemas = {
  create,
  update,
};
