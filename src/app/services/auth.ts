import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { getApiBaseUrl } from './api-config';

export interface SignupRequest {
  userName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  email: string;
  userName: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private baseUrl = `${getApiBaseUrl()}/auth`;

  constructor() {}

  async signup(user: SignupRequest) {
    try {
      return await firstValueFrom(this.http.post(`${this.baseUrl}/signup`, user));
    } catch (error) {
      throw this.getErrorMessage(error, 'Signup failed');
    }
  }

  async login(credentials: LoginRequest) {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      );

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userName', response.userName);
        localStorage.setItem('email', response.email);
      }

      return response;
    } catch (error) {
      throw this.getErrorMessage(error, 'Login failed');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('email');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUserName() {
    return localStorage.getItem('userName');
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Cannot connect to API. Start the backend server and try again.';
      }

      const apiMessage = this.extractApiMessage(error.error);
      if (apiMessage) {
        return apiMessage;
      }

      if (error.status === 503) {
        return 'API service is unavailable. Please check the backend service.';
      }

      return `${fallback} (HTTP ${error.status})`;
    }

    return fallback;
  }

  private extractApiMessage(errorBody: unknown): string | null {
    if (!errorBody) {
      return null;
    }

    if (typeof errorBody === 'string') {
      return errorBody;
    }

    if (typeof errorBody === 'object' && 'message' in errorBody) {
      const message = (errorBody as { message?: unknown }).message;
      return typeof message === 'string' ? message : null;
    }

    return null;
  }
}
