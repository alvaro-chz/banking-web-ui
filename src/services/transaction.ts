import api from './api';

// Tipos para la respuesta
export interface TransactionResponse {
  id: number;
  sourceAccount: string;
  targetAccount: string;
  transactionType: string; // TRANSFER, DEPOSIT, WITHDRAW, PAYMENT
  amount: number;
  transactionStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  description: string;
  referenceCode: string;
  currency: string;
  createdAt: string;
}

// Tipo para la paginación de Spring Boot
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Página actual
}

// Filtros
export interface TransactionFilters {
  status?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  page?: number;
  size?: number;
}

// Servicio
export const getTransactionHistory = async (
  accountNumber: string,
  userId: number,
  filters: TransactionFilters
): Promise<Page<TransactionResponse>> => {
  
  // Construimos los query params
  const params = new URLSearchParams();
  params.append('userId', userId.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  params.append('page', (filters.page || 0).toString());
  params.append('size', (filters.size || 10).toString());

  const response = await api.get<Page<TransactionResponse>>(
    `/api/v1/transactions/history/account/${accountNumber}`,
    { params }
  );
  
  return response.data;
};

export interface TransferRequest {
  sourceAccount: string;
  targetAccount: string;
  amount: number;
  currency: string;
  description: string;
}

export interface DepositRequest {
  targetAccount: string;
  amount: number;
  currency: string;
  description: string;
}

export interface WithdrawRequest {
  sourceAccount: string;
  amount: number;
  currency: string;
  description: string;
}

export interface PayServiceRequest {
  sourceAccount: string;
  amount: number;
  currency: string;
  description: string;
  serviceName: string;
  supplyCode: string;
}

export const performTransfer = async (data: TransferRequest, userId: number) => {
  const response = await api.post(`/api/v1/transactions/user/${userId}/transfer`, data);
  return response.data;
};

export const performDeposit = async (data: DepositRequest) => {
  // Nota: Deposit suele ser público o no requerir ID de usuario en la URL según tu controller
  const response = await api.post(`/api/v1/transactions/deposit`, data);
  return response.data;
};

export const performWithdraw = async (data: WithdrawRequest, userId: number) => {
  const response = await api.post(`/api/v1/transactions/user/${userId}/withdraw`, data);
  return response.data;
};

export const performPayment = async (data: PayServiceRequest, userId: number) => {
  const response = await api.post(`/api/v1/transactions/user/${userId}/payment`, data);
  return response.data;
};