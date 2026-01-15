import api from './api';

export interface BeneficiaryResponse {
  id: number;
  alias: string;
  accountNumber: string;
  bankName: string;
}

export interface BeneficiaryRequest {
  alias: string;
  accountNumber: string;
  bankName: string;
}

// 1. Listar
export const getBeneficiaries = async (userId: number): Promise<BeneficiaryResponse[]> => {
  const response = await api.get<BeneficiaryResponse[]>(`/api/v1/beneficiaries/user/${userId}`);
  return response.data;
};

// 2. Crear
export const addBeneficiary = async (data: BeneficiaryRequest, userId: number): Promise<BeneficiaryResponse> => {
  const response = await api.post<BeneficiaryResponse>(`/api/v1/beneficiaries/user/${userId}`, data);
  return response.data;
};

// 3. Actualizar
export const updateBeneficiary = async (data: BeneficiaryRequest, id: number, userId: number): Promise<BeneficiaryResponse> => {
  const response = await api.put<BeneficiaryResponse>(`/api/v1/beneficiaries/user/${userId}/${id}`, data);
  return response.data;
};

// 4. Eliminar
export const deleteBeneficiary = async (id: number, userId: number): Promise<void> => {
  await api.delete(`/api/v1/beneficiaries/user/${userId}/${id}`);
};