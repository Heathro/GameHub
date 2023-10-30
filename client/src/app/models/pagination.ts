export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export class PaginatedResult<T> {
  result?: T;
  pagination?: Pagination;
}

export class PaginationParams {
  currentPage = 1;
  itemsPerPage = 4;

  constructor(currentPage: number, itemsPerPage: number) {
    this.currentPage = currentPage;
    this.itemsPerPage = itemsPerPage;
  }
}