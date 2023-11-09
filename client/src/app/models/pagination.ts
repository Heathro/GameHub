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
  orderBy = 'az';

  constructor(itemsPerPage: number, orderBy?: string) {
    this.itemsPerPage = itemsPerPage;
    if (orderBy )this.orderBy = orderBy;
  }
}