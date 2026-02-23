import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage implements OnInit {
  username: string = '';
  tokenPreview: string = '';
  loginTime: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    // Ambil data dari Capacitor Preferences
    this.username = (await this.auth.getUsername()) || 'Pengguna';
    const token = await this.auth.getToken();

    // Tampilkan sebagian token saja (keamanan)
    if (token) {
      this.tokenPreview = token.substring(0, 30) + '...';
    }

    this.loginTime = new Date().toLocaleString('id-ID');
  }

  async logout() {
    const confirm = await this.alertController.create({
      header: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin keluar? Token Anda akan dihapus.',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Keluar',
          handler: async () => {
            await this.auth.logout(); // Hapus token dari Capacitor Preferences
            const toast = await this.toastCtrl.create({
              message: 'Berhasil logout. Sampai jumpa!',
              duration: 2000,
              color: 'medium'
            });
            await toast.present();
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      ]
    });
    await confirm.present();
  }
}