import api from './api';

// Definimos qué esperamos enviar (Tipos)
export interface LoginRequest {
  email: string;  // O username, según cómo lo hiciste en Java
  password: string;
}

// Definimos qué esperamos recibir del Backend
export interface AuthResponse {
  token: string;
  id: Number;
  name: string;
  // Agrega aquí otros campos si tu backend devuelve más cosas (ej: nombre, rol)
}

export const loginService = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // Hacemos la petición POST al endpoint de tu backend
  // Ajusta '/api/auth/login' si tu ruta en Java es diferente
  const response = await api.post<AuthResponse>('/api/v1/auth/login', credentials);
  return response.data;
};

// Agrega esta interfaz (Ajusta los campos a tu DTO de Java)
export interface RegisterRequest {
  name: string;
  lastName1: string;
  lastName2?: string; // Opcional (no tiene @NotBlank en Java)
  documentId: string;
  email: string;
  password: string;
  phoneNumber: string;
}

// Agrega la función de registro
export const registerService = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/v1/auth/register', userData);
  return response.data;
};