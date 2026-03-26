import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('romula_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('romula_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error('Unauthorized');
    }

    const data: ApiResponse<T> = await response.json().catch(() => ({}));
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'API Request Failed');
    }

    return data.data as T;
  }

  async get<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'GET' }); }
  async post<T>(endpoint: string, body?: any) { 
    return this.request<T>(endpoint, { 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }); 
  }
  async put<T>(endpoint: string, body: any) { 
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }); 
  }
  async patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  }
  async delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiClient();
