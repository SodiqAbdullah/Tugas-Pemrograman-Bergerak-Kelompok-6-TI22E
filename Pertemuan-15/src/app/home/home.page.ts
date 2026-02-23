import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonButton, IonItem, IonLabel, IonToggle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonToggle
  ],
})
export class HomePage {
  // Variables for login
  username = '';
  password = '';
  
  // Variable for Fake GPS simulation
  isFakeGPS = false;
  
  // Variable for topup
  topupAmount = 0;
  
  // Result message to display
  resultMessage = '';

  constructor(private http: HttpClient) {}

  // 1. DEMO SQL INJECTION - Vulnerable Login
  loginVulnerable() {
    const data = { username: this.username, password: this.password };
    
    this.http.post('http://localhost:3000/api/login-vulnerable', data).subscribe({
      next: (res: any) => {
        this.resultMessage = res.message;
        if (res.user) {
          this.resultMessage += ` | User: ${res.user.username}, Saldo: ${res.user.saldo}`;
        }
      },
      error: (err) => {
        this.resultMessage = err.error?.message || 'Login Gagal';
      }
    });
  }

  // 2. DEMO SECURE LOGIN - With Parameterized Query
  loginSecure() {
    const data = { username: this.username, password: this.password };
    
    this.http.post('http://localhost:3000/api/login-secure', data).subscribe({
      next: (res: any) => {
        this.resultMessage = res.message;
        if (res.user) {
          this.resultMessage += ` | User: ${res.user.username}, Saldo: ${res.user.saldo}`;
        }
      },
      error: (err) => {
        this.resultMessage = err.error?.message || 'Login Gagal';
      }
    });
  }

  // 3. DEMO FAKE GPS DETECTION
  kirimLokasi() {
    // Simulasi mengambil data GPS asli
    const payload = {
      lat: -6.732023,
      lng: 108.552319,
      isMock: this.isFakeGPS // Data ini biasanya diambil dari plugin Geolocation
    };

    this.http.post('http://localhost:3000/api/absen-lokasi', payload).subscribe({
      next: (res: any) => {
        this.resultMessage = res.message;
      },
      error: (err) => {
        // Akan merah jika fake GPS aktif
        this.resultMessage = err.error?.message || 'Error';
      }
    });
  }

  // 4. DEMO SERVER-SIDE VALIDATION - Topup
  topup() {
    // Demo: User mencoba manipulasi nominal topup
    // Client hanya mengirim request, server yang memvalidasi
    const payload = {
      userId: 1,
      requestedAmount: this.topupAmount
    };

    this.http.post('http://localhost:3000/api/topup', payload).subscribe({
      next: (res: any) => {
        this.resultMessage = res.message + ` | Amount: Rp ${res.amount.toLocaleString('id-ID')}`;
      },
      error: (err) => {
        this.resultMessage = err.error?.message || 'Topup Gagal';
      }
    });
  }
}
