import client from "../client";

export interface DashboardSeriesPoint {
  date: string;
  users: number;
  products: number;
  applications: number;
  conversations: number;
  messages: number;
}

export interface DashboardResponse {
  from: string;
  to: string;
  range: string;
  total_users: number;
  total_products: number;
  total_applications: number;
  total_conversations: number;
  total_messages: number;
  series: DashboardSeriesPoint[];
}

interface DashboardParams {
  range?: string;
  from?: string;
  to?: string;
}

export const fetchDashboard = async (
  params: DashboardParams = { range: "week" },
): Promise<DashboardResponse> => {
  const response = await client.get("/admin/dashboard", { params });
  return response.data.data;
};
