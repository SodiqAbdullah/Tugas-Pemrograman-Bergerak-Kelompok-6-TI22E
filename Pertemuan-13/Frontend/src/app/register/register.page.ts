import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class RegisterPage {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async register() {
    if (!this.username || !this.password || !this.confirmPassword) {
      await this.showToast('Semua field wajib diisi!', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.showToast('Password dan konfirmasi tidak cocok!', 'danger');
      return;
    }

    if (this.password.length < 6) {
      await this.showToast('Password minimal 6 karakter!', 'warning');
      return;
    }

    this.isLoading = true;

    this.auth.register({ username: this.username, password: this.password })
      .subscribe({
        next: async (res) => {
          this.isLoading = false;
          await this.showToast('Berhasil Daftar! Silakan Login.', 'success');
          this.router.navigate(['/login']);
        },
        error: async (err) => {
          this.isLoading = false;
          const pesan = err.error?.error || 'Gagal mendaftar. Cek koneksi server.';
          await this.showToast(pesan, 'danger');
        }
      });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}