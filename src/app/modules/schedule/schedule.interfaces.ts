export type IScheduleFilterRequest = {
  startDateTime?: Date | undefined;
  endDateTime?: Date | undefined;
};

export type ISchedulePayload = {
  startDate: string;
  endDate: string;
  startingTime: string;
  endingTime: string;
  duration?: number;
};
