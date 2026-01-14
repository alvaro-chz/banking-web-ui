import api from './api';

// Tu DTO exacto de Java
export interface AccountResponse {
  id: number;
  currency: string;
  currentBalance: number;
  accountType: string;
  accountNumber: string;
}

// Ahora pide el userId para completar la URL: /api/v1/accounts/user/{id}
export const getAccountsByUserId = async (userId: number): Promise<AccountResponse[]> => {
  const response = await api.get<AccountResponse[]>(`/api/v1/accounts/user/${userId}`);
  return response.data;
};

export interface AccountCreationRequest {
  currency: string;    // "USD", "PEN", "MXN"
  accountType: string; // "AHORROS", "CORRIENTE"
}

export const createAccount = async (data: AccountCreationRequest, userId: number): Promise<AccountResponse> => {
  const response = await api.post<AccountResponse>(`/api/v1/accounts/user/${userId}`, data);
  return response.data;
};