import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class LoginPage {
  username: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async login() {
    if (!this.username || !this.password) {
      await this.showToast('Username dan password tidak boleh kosong!', 'warning');
      return;
    }

    this.isLoading = true;

    this.auth.login({ username: this.username, password: this.password })
      .subscribe({
        next: async (res) => {
          this.isLoading = false;

          // 1. Simpan token JWT ke Capacitor Preferences (penyimpanan native HP)
          await this.auth.setToken(res.token);
          await this.auth.setUsername(res.username || this.username);

          // 2. Tampilkan pesan sukses
          await this.showToast('Login Berhasil! Selamat datang, ' + this.username, 'success');

          // 3. Masuk ke halaman Home
          this.router.navigate(['/home'], { replaceUrl: true });
        },
        error: async (err) => {
          this.isLoading = false;
          const pesan = err.error?.error || 'Gagal login. Cek koneksi server.';
          await this.showToast(pesan, 'danger');
        }
      });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}