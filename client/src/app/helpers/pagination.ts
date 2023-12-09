import { OrderType } from "./orderType";

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
  orderType = OrderType.az;

  constructor(itemsPerPage: number, orderType: OrderType) {
    this.itemsPerPage = itemsPerPage;
    this.orderType = orderType;
  }
}