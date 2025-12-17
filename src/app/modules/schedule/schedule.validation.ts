import { z } from "zod";

const baseSchema = z.object({
  startDate: z.string().describe("Start date is required."),
  endDate: z.string().describe("End date is required."),
  startingTime: z.string().describe("Starting time is required."),
  endingTime: z.string().describe("Ending time is required."),
  duration: z.number().optional().describe("Duration in minutes."),
});

const create = z.object({
  body: baseSchema,
});

export const scheduleValidationSchemas = {
  create,
};
