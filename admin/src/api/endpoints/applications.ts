import client from "../client";
import type { Application, PaginationMeta } from "../../types";

interface ApplicationsResponse {
  applications: Application[];
  meta: PaginationMeta;
}

export const fetchApplications = async (
  page: number,
  status?: string,
): Promise<ApplicationsResponse> => {
  const params: Record<string, string | number> = { page, limit: 10 };
  if (status) params.status = status;
  const response = await client.get("/admin/applications", { params });
  return response.data.data;
};

export const fetchApplicationById = async (
  id: string,
): Promise<Application> => {
  const response = await client.get(`/admin/applications/${id}`);
  return (response.data.data?.application ??
    response.data.data ??
    response.data) as Application;
};

export const updateApplicationStatus = async (
  id: string,
  status: Application["status"],
): Promise<Application> => {
  const response = await client.patch(`/admin/applications/${id}`, { status });
  return response.data.data;
};
