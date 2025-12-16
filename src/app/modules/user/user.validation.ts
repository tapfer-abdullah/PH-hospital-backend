import { z } from "zod";

const query = z.object({
  query: z.object({
    name: z.string().optional(),
  }),
});

const create = z.object({
  body: z.object({
    name: z.string().min(3, "Name is required."),
    contactNumber: z
      .string()
      .min(10, "Contact number must be at least 10 digits."),
    email: z.string().email("Invalid email address."),
    currentWorkplace: z.string().min(3, "Current workplace is required."),
    experience: z.number().min(0, "Experience must be a non-negative"),
    gender: z.string().min(3, "Gender is required."),
    qualification: z.string().min(3, "Qualification is required."),
    appointmentFee: z.number().min(0, "Appointment fee must be a non-negative"),
    designation: z.string().min(3, "Description is required."),
    registrationNumber: z.string().min(3, "Registration number is required."),
    address: z.string().optional(),
    profilePhoto: z.string().optional(),
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
    email: z.string().optional(),
    currentWorkplace: z.string().optional(),
    experience: z.number().optional(),
    gender: z.string().optional(),
    qualification: z.string().optional(),
    appointmentFee: z.number().optional(),
    designation: z.string().optional(),
    registrationNumber: z.string().optional(),
    address: z.string().optional(),
    profilePhoto: z.string().optional(),
  }),
});

export const userValidationSchemas = {
  create,
  update,
};
