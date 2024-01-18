import { HttpClient, HttpParams } from "@angular/common/http";

import { map } from "rxjs";

import { Filter } from "../models/filter";
import { OrderType } from "../enums/orderType";

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

export class PaginationFunctions {
  static getPaginationHeaders(paginationParams: PaginationParams) {
  	let params = new HttpParams();
  
    params = params.append('currentPage', paginationParams.currentPage);
    params = params.append('itemsPerPage', paginationParams.itemsPerPage);
    params = params.append('orderType', paginationParams.orderType);
  
    return params;
  }
  
  static getPaginatedResult<T>(url: string, params: HttpParams, http: HttpClient) {
  	const paginationResult: PaginatedResult<T> = new PaginatedResult<T>;
  
  	return http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        if (response.body) paginationResult.result = response.body;
        const pagination = response.headers.get('Pagination');
        if (pagination) paginationResult.pagination = JSON.parse(pagination);
        return paginationResult;
      })
    );
  }
  
  static getFilteredPaginatedResult<T>(
      url: string, params: HttpParams, http: HttpClient, filter: Filter
    ) {
    const paginationResult: PaginatedResult<T> = new PaginatedResult<T>;
    
    return http.post<T>(url, filter, { observe: 'response', params }).pipe(
      map(response => {
        if (response.body) paginationResult.result = response.body;
        const pagination = response.headers.get('Pagination');
        if (pagination) paginationResult.pagination = JSON.parse(pagination);
        return paginationResult;
      })
    );
  }
}

