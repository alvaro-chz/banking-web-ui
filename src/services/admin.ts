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

export interface UserAdminResponse {
  id: number;
  fullName: string;
  documentId: string;
  email: string;
  phoneNumber: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface UserFilters {
    page?: number;
    size?: number;
    term?: string;
    isActive?: boolean;
    isBlocked?: boolean;
}

export const getUsers = async (filters: UserFilters) => {
    // Limpiamos los undefined/null para no mandarlos en la URL
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.term) params.append('term', filters.term);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.isBlocked !== undefined) params.append('isBlocked', filters.isBlocked.toString());

    const response = await api.get(`/api/v1/admin/users?${params.toString()}`);
    return response.data;
};

export const unblockUser = async (userId: number) => {
    const response = await api.patch(`/api/v1/admin/users/${userId}/unblock`);
    return response.data;
};

export interface AdminTransactionFilters {
  accountNumber?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

export const getAllTransactions = async (filters: AdminTransactionFilters) => {
  const params = new URLSearchParams();
  
  if (filters.accountNumber) params.append('accountNumber', filters.accountNumber);
  if (filters.status) params.append('status', filters.status);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  
  params.append('page', (filters.page || 0).toString());
  params.append('size', (filters.size || 10).toString()); // 10 o 20, tu decides

  const response = await api.get(`/api/v1/admin/transactions?${params.toString()}`);
  return response.data;
};