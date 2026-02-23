import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PatrolService, DataPatroli } from '../services/patrol.service';

@Component({
  selector: 'app-riwayat',
  templateUrl: 'riwayat.page.html',
  styleUrls: ['riwayat.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class RiwayatPage implements OnInit {
  riwayat: DataPatroli[] = [];
  isLoading: boolean = true;
  fotoTerpilih: string | undefined;

  constructor(
    private patrolService: PatrolService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadRiwayat();
  }

  async loadRiwayat() {
    this.isLoading = true;
    try {
      this.riwayat = await this.patrolService.getRiwayat();
    } catch (error: any) {
      const pesan = error?.error?.error || error?.message || 'Cek koneksi ke server.';
      const alert = await this.alertController.create({
        header: 'Gagal Memuat', message: pesan, buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isLoading = false;
    }
  }

  formatTanggal(tanggal: string): string {
    if (!tanggal) return '-';
    return new Date(tanggal).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  lihatFoto(foto: string) {
    this.fotoTerpilih = foto;
  }

  tutupFoto() {
    this.fotoTerpilih = undefined;
  }

  kembali() {
    this.router.navigate(['/home']);
  }
}