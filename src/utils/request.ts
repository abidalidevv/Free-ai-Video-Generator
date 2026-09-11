/**
 * Thin wrappers around the shared axios client. Services should prefer
 * these helpers so call sites stay symmetrical and cancel-safe.
 * Automatically unwraps MoneyPrinterTurbo's response envelope: { status, data, message }.
 */

import type { AxiosRequestConfig } from "axios";
import { apiClient } from "../api/client";

function unwrapResponse<T>(resData: any): T {
  if (
    resData &&
    typeof resData === "object" &&
    "status" in resData &&
    "data" in resData
  ) {
    return resData.data as T;
  }
  return resData as T;
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<any>(url, config);
  return unwrapResponse<T>(res.data);
}

export async function post<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<any>(url, body, config);
  return unwrapResponse<T>(res.data);
}

export async function put<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.put<any>(url, body, config);
  return unwrapResponse<T>(res.data);
}

export async function patch<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.patch<any>(url, body, config);
  return unwrapResponse<T>(res.data);
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<any>(url, config);
  return unwrapResponse<T>(res.data);
}
