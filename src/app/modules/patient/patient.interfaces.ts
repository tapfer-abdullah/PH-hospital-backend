export type IPatientsFilterRequest = {
  search?: string | undefined;
  name?: string | undefined;
  contactNumber?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  isDeleted?: boolean | undefined;
};
