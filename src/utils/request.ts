/**
 * Thin wrappers around the shared axios client. Services should prefer
 * these helpers so call sites stay symmetrical and cancel-safe.
 */

import type { AxiosRequestConfig } from "axios";
import { apiClient } from "../api/client";

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function post<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<T>(url, body, config);
  return res.data;
}

export async function put<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.put<T>(url, body, config);
  return res.data;
}

export async function patch<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.patch<T>(url, body, config);
  return res.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}
