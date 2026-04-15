import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Auth } from './auth';
import { getApiBaseUrl } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class Measurement {
  private http = inject(HttpClient);
  private baseUrl = `${getApiBaseUrl()}/measurements`;
  private auth = inject(Auth);

  constructor() {}

  async convert(data: { value: number; fromUnit: string; toUnit: string }) {
    try {
      return await firstValueFrom(this.http.post<any>(`${this.baseUrl}/convert`, data));
    } catch (error) {
      throw this.getErrorMessage(error, 'Conversion failed');
    }
  }

  async getHistory() {
    try {
      const token = this.auth.getToken();
      const options = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined;

      return await firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/history`, options));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.auth.logout();
      }

      throw this.getErrorMessage(error, 'Failed to fetch history');
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Cannot connect to API. Start the backend server and try again.';
      }

      if (typeof error.error === 'object' && error.error && 'message' in error.error) {
        const message = (error.error as { message?: unknown }).message;
        if (typeof message === 'string') {
          return message;
        }
      }

      if (error.status === 503) {
        return 'API service is unavailable. Please check the backend service.';
      }

      return `${fallback} (HTTP ${error.status})`;
    }

    return fallback;
  }
}
