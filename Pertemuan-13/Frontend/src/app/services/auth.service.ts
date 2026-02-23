import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ⚠️ Ganti IP ini jika testing di HP fisik
  private apiUrl = 'http://localhost:3000/api';
  // private apiUrl = 'http://192.168.13.20:3000/api'; // IP untuk testing di smarrtphone fisik (sesuaikan dengan IP komputer Anda)


  constructor(private http: HttpClient) {}

  register(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  async setToken(token: string): Promise<void> {
    await Preferences.set({ key: 'auth_token', value: token });
  }

  async setUsername(username: string): Promise<void> {
    await Preferences.set({ key: 'username', value: username });
  }

  async setUserId(id: number): Promise<void> {
    await Preferences.set({ key: 'user_id', value: String(id) });
  }

  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'auth_token' });
    return value;
  }

  async getUsername(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'username' });
    return value;
  }

  async isLoggedIn(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'auth_token' });
    return value !== null && value !== '';
  }

  async logout(): Promise<void> {
    await Preferences.remove({ key: 'auth_token' });
    await Preferences.remove({ key: 'username' });
    await Preferences.remove({ key: 'user_id' });
  }
}