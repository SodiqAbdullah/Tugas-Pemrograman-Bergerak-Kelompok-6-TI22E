import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export interface DataPatroli {
  id?: number;
  id_petugas?: number;
  username?: string;
  nama_lokasi: string;
  no_resi?: string;
  latitude: number;
  longitude: number;
  jarak: number;
  status: 'Dalam Jangkauan' | 'Di Luar Jangkauan';
  foto?: string;         // base64
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class PatrolService {

  // ⚠️ Ganti IP ini jika testing di HP fisik
  // Contoh: 'http://192.168.1.100:3000/api'
  private apiUrl = 'http://localhost:3000/api';
  // private apiUrl = 'http://192.168.13.20:3000/api'; // IP untuk testing di smarrtphone fisik (sesuaikan dengan IP komputer Anda)


  constructor(private http: HttpClient) {}

  // Ambil token dari Capacitor Preferences
  private async getHeaders(): Promise<HttpHeaders> {
    const { value } = await Preferences.get({ key: 'auth_token' });
    return new HttpHeaders({
      'Authorization': `Bearer ${value}`,
      'Content-Type': 'application/json'
    });
  }

  // Simpan laporan patroli ke MySQL
  async simpanPatroli(data: DataPatroli): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(
      this.http.post(`${this.apiUrl}/patroli`, data, { headers })
    );
  }

  // Ambil riwayat patroli milik user yang login
  async getRiwayat(): Promise<DataPatroli[]> {
    const headers = await this.getHeaders();
    return firstValueFrom(
      this.http.get<DataPatroli[]>(`${this.apiUrl}/patroli`, { headers })
    );
  }
}