import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Measurement {
  private baseUrl = 'http://localhost:5139/api/v1/measurements';
  private auth = inject(Auth);

  constructor() {}

  async convert(data: { value: number; fromUnit: string; toUnit: string }) {
    try {
      const response = await axios.post(`${this.baseUrl}/convert`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Conversion failed';
    }
  }

  async getHistory() {
    try {
      const token = this.auth.getToken();
      const response = await axios.get(`${this.baseUrl}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.auth.logout();
      }
      throw error.response?.data?.message || 'Failed to fetch history';
    }
  }
}
