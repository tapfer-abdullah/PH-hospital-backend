type IOptions = {
  currentPage?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | undefined;
};

type IPaginationResult = {
  currentPage: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

const calculatePagination = (options: IOptions): IPaginationResult => {
  const currentPage = Number(options.currentPage) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (currentPage - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder === "asc" ? "asc" : "desc";

  return { currentPage, limit, skip, sortBy, sortOrder };
};

export { calculatePagination, type IPaginationResult, type IOptions };
