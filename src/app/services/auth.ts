import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = 'https://measurement.azurewebsites.net/api/v1/auth';

  constructor() {}

  async signup(user: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/signup`, user);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Signup failed';
    }
  }

  async login(credentials: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.userName);
        localStorage.setItem('email', response.data.email);
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Login failed';
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
}
