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
  category = 'all';

  constructor(itemsPerPage: number, orderBy: string, category: string) {
    this.itemsPerPage = itemsPerPage;
    this.orderBy = orderBy;
    this.category = category;
  }
}