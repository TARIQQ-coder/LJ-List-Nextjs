import client from "../client";
import type { User, PaginationMeta } from "../../types";

interface UsersResponse {
  users: User[];
  meta: PaginationMeta;
}

export const fetchUsers = async (
  page: number,
  role?: string,
): Promise<UsersResponse> => {
  const params: Record<string, string | number> = { page, limit: 10 };
  if (role) params.role = role;
  const response = await client.get("/admin/users", { params });
  return response.data.data;
};

export const updateUser = async (
  id: string,
  payload: Partial<Pick<User, "display_name" | "phone_number" | "role">>,
): Promise<{ user: User }> => {
  const response = await client.patch(`/admin/users/${id}`, payload);
  return response.data.data;
};

export const fetchUserById = async (id: string): Promise<User> => {
  const response = await client.get(`/admin/users/${id}`);
  return response.data.data.user ?? response.data.data;
};
