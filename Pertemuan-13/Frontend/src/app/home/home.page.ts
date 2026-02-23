import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, ViewDidEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as L from 'leaflet';

import { AuthService } from '../services/auth.service';
import { PatrolService } from '../services/patrol.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit, ViewDidEnter {

  // Data GPS
  latitude: number = -6.2088;
  longitude: number = 106.8456;
  jarak: number | undefined;

  // Data foto — disimpan sebagai base64 untuk dikirim ke MySQL
  capturedImage: string | undefined;       // Untuk ditampilkan di UI (webPath)
  capturedImageBase64: string | undefined; // Untuk dikirim ke backend

  // Form laporan
  namaLokasi: string = '';
  noResi: string = '';

  // State
  sudahFoto: boolean = false;
  usernameLogin: string = '';

  // Leaflet
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private baseLayer: L.TileLayer | undefined;
  private isSatelliteView: boolean = false;
  private osmTile = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // ⚠️ GANTI dengan koordinat target patroli Anda
  targetLat = -6.742169;
  targetLng = 108.493165;

  constructor(
    private authService: AuthService,
    private patrolService: PatrolService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.setupLeafletIcons();
    this.usernameLogin = (await this.authService.getUsername()) || '';
  }

  async ionViewDidEnter() {
    await this.initMap();
  }

  // ========== HELPER ==========
  private setupLeafletIcons() {
    try { delete (L.Icon.Default.prototype as any)._getIconUrl; } catch (e) {}
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }

  private async showAlert(header: string, message: string) {
    const alertDialog = await this.alertController.create({
      header, message, buttons: ['OK']
    });
    await alertDialog.present();
  }

  // ========== 1. INISIALISASI PETA ==========
  async initMap() {
    try {
      await this.ensureLocationPermission();
      await this.getCurrentLocation();

      const mapEl = document.getElementById('map');
      if (!mapEl) return;

      if (this.map) { this.map.remove(); this.map = undefined; }

      this.map = L.map('map').setView([this.latitude, this.longitude], 15);
      this.baseLayer = L.tileLayer(this.osmTile, {
        attribution: '© OpenStreetMap contributors', maxZoom: 19
      }).addTo(this.map);

      // Marker posisi user (biru)
      this.marker = L.marker([this.latitude, this.longitude])
        .addTo(this.map).bindPopup('📍 Posisi Anda').openPopup();

      // Marker target patroli (merah)
      L.marker([this.targetLat, this.targetLng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
        })
      }).addTo(this.map).bindPopup('🎯 Titik Target Patroli');

      setTimeout(() => { this.map?.invalidateSize(); }, 300);

    } catch (error) {
      console.error('Error initMap:', error);
    }
  }

  private async ensureLocationPermission(): Promise<boolean> {
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location === 'granted') return true;
      const result = await Geolocation.requestPermissions();
      return result.location === 'granted';
    } catch (e) {
      return true;
    }
  }

  // ========== 2. GPS ==========
  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, timeout: 10000
      });
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;

      if (this.map && this.marker) {
        this.map.setView([this.latitude, this.longitude], 15);
        this.marker.setLatLng([this.latitude, this.longitude]);
        this.marker.bindPopup('📍 Posisi Anda').openPopup();
      }
      this.hitungJarak();
    } catch (error: any) {
      await this.showAlert('GPS Error', `Gagal mendapatkan lokasi: ${error?.message}`);
    }
  }

  // ========== 3. HITUNG JARAK ==========
  hitungJarak() {
    const R = 6371e3;
    const φ1 = this.latitude * Math.PI / 180;
    const φ2 = this.targetLat * Math.PI / 180;
    const Δφ = (this.targetLat - this.latitude) * Math.PI / 180;
    const Δλ = (this.targetLng - this.longitude) * Math.PI / 180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
    this.jarak = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // ========== 4. AMBIL FOTO (Konversi ke Base64) ==========
  async mulaiPatroli() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,           // Kurangi kualitas agar base64 tidak terlalu besar
        allowEditing: false,
        resultType: CameraResultType.Base64, // ✅ Langsung minta base64
        source: CameraSource.Camera
      });

      // Simpan base64 untuk dikirim ke backend
      this.capturedImageBase64 = `data:image/jpeg;base64,${image.base64String}`;

      // Tampilkan di UI
      this.capturedImage = this.capturedImageBase64;

      // Update lokasi setelah foto
      await this.getCurrentLocation();
      this.sudahFoto = true;

      if (this.jarak !== undefined && this.jarak > 100) {
        await this.showAlert(
          '⚠️ Di Luar Jangkauan',
          `Anda berada ${this.jarak.toFixed(0)} meter dari titik target.\nAnda tetap bisa menyimpan laporan.`
        );
      }
    } catch (error) {
      console.error('Kamera error:', error);
      await this.showAlert('Gagal', 'Gagal membuka kamera. Cek izin kamera!');
    }
  }

  // ========== 5. SIMPAN KE MYSQL ==========
  async simpanLaporan() {
    if (!this.capturedImageBase64) {
      await this.showAlert('Perhatian', 'Ambil foto bukti terlebih dahulu!');
      return;
    }
    if (!this.namaLokasi.trim()) {
      await this.showAlert('Perhatian', 'Nama lokasi harus diisi!');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Menyimpan laporan ke server...', spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.patrolService.simpanPatroli({
        nama_lokasi: this.namaLokasi,
        no_resi: this.noResi || '-',
        latitude: this.latitude,
        longitude: this.longitude,
        jarak: this.jarak || 0,
        status: (this.jarak !== undefined && this.jarak <= 100)
          ? 'Dalam Jangkauan'
          : 'Di Luar Jangkauan',
        foto: this.capturedImageBase64
      });

      await loading.dismiss();
      await this.showAlert('✅ Berhasil', 'Laporan patroli berhasil disimpan ke database!');

      // Reset form
      this.capturedImage = undefined;
      this.capturedImageBase64 = undefined;
      this.namaLokasi = '';
      this.noResi = '';
      this.sudahFoto = false;

    } catch (error: any) {
      await loading.dismiss();
      const pesan = error?.error?.error || error?.message || 'Cek koneksi ke server.';
      await this.showAlert('Gagal Menyimpan', pesan);
    }
  }

  // ========== 6. REFRESH LOKASI ==========
  async refreshLokasi() {
    const granted = await this.ensureLocationPermission();
    if (!granted) {
      await this.showAlert('Izin Ditolak', 'Aktifkan izin lokasi di pengaturan perangkat.');
      return;
    }
    await this.getCurrentLocation();
    await this.showAlert('Berhasil', 'Lokasi diperbarui!');
  }

  // ========== 7. SATELLITE VIEW ==========
  async ubahKeSatellite() {
    if (!this.map) return;
    if (!this.isSatelliteView) {
      if (this.baseLayer) this.map.removeLayer(this.baseLayer);
      this.baseLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri', maxZoom: 19 }
      ).addTo(this.map);
      this.isSatelliteView = true;
    } else {
      if (this.baseLayer) this.map.removeLayer(this.baseLayer);
      this.baseLayer = L.tileLayer(this.osmTile, {
        attribution: '© OpenStreetMap contributors', maxZoom: 19
      }).addTo(this.map);
      this.isSatelliteView = false;
    }
  }

  // ========== 8. NAVIGASI ==========
  lihatRiwayat() {
    this.router.navigate(['/riwayat']);
  }

  async logout() {
    const confirm = await this.alertController.create({
      header: 'Konfirmasi', message: 'Yakin ingin keluar?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Keluar', handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      ]
    });
    await confirm.present();
  }
}