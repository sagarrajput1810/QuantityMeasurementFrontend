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

  private getAuthOptions() {
    const token = this.auth.getToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  async convert(data: { value: number; fromUnit: string; toUnit: string }) {
    try {
      return await firstValueFrom(this.http.post<any>(`${this.baseUrl}/convert`, data, this.getAuthOptions()));
    } catch (error) {
      throw this.getErrorMessage(error, 'Conversion failed');
    }
  }

  async compare(data: { value1: number; unit1: string; value2: number; unit2: string }) {
    try {
      return await firstValueFrom(this.http.post<any>(`${this.baseUrl}/compare`, data, this.getAuthOptions()));
    } catch (error) {
      throw this.getErrorMessage(error, 'Comparison failed');
    }
  }

  async performOperation(data: { value1: number; unit1: string; value2: number; unit2: string; operation: string }) {
    try {
      return await firstValueFrom(this.http.post<any>(`${this.baseUrl}/operation`, data, this.getAuthOptions()));
    } catch (error) {
      throw this.getErrorMessage(error, 'Operation failed');
    }
  }

  async deleteHistory() {
    try {
      return await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/history`, this.getAuthOptions()));
    } catch (error) {
      throw this.getErrorMessage(error, 'Delete history failed');
    }
  }

  async getHistory() {
    try {
      return await firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/history`, this.getAuthOptions()));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.auth.logout();
      }
      throw this.getErrorMessage(error, 'Failed to fetch history');
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'Cannot connect to API. Start backend server.';
      const errObj = error.error as any;
      if (errObj && errObj.message) return errObj.message;
      if (errObj && errObj.title) return errObj.title;
      return `${fallback} (HTTP ${error.status})`;
    }
    return fallback;
  }
}
