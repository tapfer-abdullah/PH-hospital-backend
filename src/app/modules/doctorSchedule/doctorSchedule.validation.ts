import { z } from "zod";

const baseSchema = z.object({
  slots: z.array(z.string()).describe("Array of slot date-time strings."),
});

const create = z.object({
  body: baseSchema,
});

export const doctorScheduleValidationSchemas = {
  create,
};
