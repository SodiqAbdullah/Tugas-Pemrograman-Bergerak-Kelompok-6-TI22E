import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ⚠️ Ganti IP ini dengan IP komputer Anda saat testing di HP fisik
  // Contoh: 'http://192.168.1.100:3000/api'
  // Saat testing di browser (ionic serve): bisa pakai 'http://localhost:3000/api'
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ========== HTTP REQUESTS ==========

  register(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // ========== CAPACITOR PREFERENCES (Simpan Token) ==========

  // Simpan token JWT ke penyimpanan native HP
  async setToken(token: string): Promise<void> {
    await Preferences.set({ key: 'auth_token', value: token });
  }

  // Simpan info username
  async setUsername(username: string): Promise<void> {
    await Preferences.set({ key: 'username', value: username });
  }

  // Ambil token
  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'auth_token' });
    return value;
  }

  // Ambil username yang tersimpan
  async getUsername(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'username' });
    return value;
  }

  // Cek apakah user sudah login (ada token tersimpan)
  async isLoggedIn(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'auth_token' });
    return value !== null && value !== '';
  }

  // Logout: hapus semua data sesi
  async logout(): Promise<void> {
    await Preferences.remove({ key: 'auth_token' });
    await Preferences.remove({ key: 'username' });
  }
}