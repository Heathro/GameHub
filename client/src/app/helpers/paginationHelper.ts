import { HttpClient, HttpParams } from "@angular/common/http";

import { map } from "rxjs";

import { PaginatedResult, PaginationParams } from "../models/pagination";
import { Filter } from "../models/filter";

export function getPaginationHeaders(paginationParams: PaginationParams) {
	let params = new HttpParams();

  params = params.append('currentPage', paginationParams.currentPage);
  params = params.append('itemsPerPage', paginationParams.itemsPerPage);
  params = params.append('orderBy', paginationParams.orderBy);

  return params;
}

export function getPaginatedResult<T>(url: string, params: HttpParams, http: HttpClient) {
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

export function getFilteredPaginatedResult<T>(
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