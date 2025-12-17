export type IDoctorScheduleFilterRequest = {
  startDateTime?: string | undefined;
  endDateTime?: string | undefined;
  isBooked?: string | undefined;
};

export type IDoctorSchedulePayload = {
  slots: string[];
};
