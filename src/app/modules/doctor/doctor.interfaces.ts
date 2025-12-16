export type IDoctorFilterRequest = {
  search?: string | undefined;
  name?: string | undefined;
  contactNumber?: string | undefined;
  experience?: number | undefined;
  appointmentFee?: number | undefined;
  qualification?: string | undefined;
  currentWorkplace?: string | undefined;
  gender?: string | undefined;

  specialty?: string | undefined;
};
