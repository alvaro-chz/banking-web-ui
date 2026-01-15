import api from './api';

export interface ChartDataPoint {
  date: string;
  amount: number;
}

export interface BlockedUserSummary {
  name: string;
  documentId: string;
  blockedAt: string;
}

export interface AdminDashboardResponse {
  retainedUsersCount: number;
  totalUsers: number;
  totalBlockedUsersCount: number;
  lastUsersBlocked: BlockedUserSummary[];
  transactionCurve: Record<string, ChartDataPoint[]>; // Map<String, List>
}

export const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const response = await api.get<AdminDashboardResponse>('/api/v1/admin/dashboard');
  return response.data;
};