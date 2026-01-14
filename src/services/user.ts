import api from './api';

export interface UserResponse {
  id: number;
  name: string;
  lastName1: string;
  lastName2: string;
  documentId: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

// DTO para actualizar contacto
export interface UserUpdateRequest {
  email: string;
  phoneNumber: string;
}

// DTO para cambiar password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmationPassword: string;
}

// 1. Obtener Perfil
export const getUserProfile = async (userId: number): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(`/api/v1/users/${userId}`);
  return response.data;
};

// 2. Actualizar Datos (Email/Teléfono)
export const updateUser = async (userId: number, data: UserUpdateRequest): Promise<UserResponse> => {
  const response = await api.put<UserResponse>(`/api/v1/users/${userId}`, data);
  return response.data;
};

// 3. Cambiar Contraseña
export const changePassword = async (userId: number, data: ChangePasswordRequest): Promise<void> => {
  await api.patch(`/api/v1/users/${userId}/password`, data);
};