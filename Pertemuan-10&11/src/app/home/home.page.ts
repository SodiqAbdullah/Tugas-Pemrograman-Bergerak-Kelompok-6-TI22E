import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core'; // <--- TAMBAH ChangeDetectorRef
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, IonButtons, IonButton, IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';

// 1. Import Icon
import { addIcons } from 'ionicons';
import { add, trash, pencil } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

// 2. Import Service Data
import { DataMahasiswaService } from '../services/data-mahasiswa.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonButtons, IonButton, IonFab, IonFabButton, IonIcon],
})
export class HomePage {

  // Array awal kosong
  dataMahasiswa: any[] = [];

  constructor(
    private dataService: DataMahasiswaService,
    private cdr: ChangeDetectorRef, // <--- INJECT DI SINI
    public alertController: AlertController,
    public router: Router
  ) {
    addIcons({ add, trash, pencil });
  }

  // Jalan setiap kali masuk halaman
  async ionViewWillEnter() {
    await this.loadData();
  }

  // Fungsi muat data
  async loadData() {
    this.dataMahasiswa = await this.dataService.getData();
    this.cdr.detectChanges();
  }

  // Fungsi hapus data
  async hapusData(mhs: any) {
    const alert = await this.alertController.create({
      header: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus data ${mhs.nama}?`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: async () => {
            await this.dataService.hapusData(mhs.id);
            await this.loadData(); // Reload data setelah hapus
          }
        }
      ]
    });

    await alert.present();
  }

  // Fungsi edit data
  editData(mhs: any) {
    // Navigasi ke halaman tambah dengan state untuk edit
    this.router.navigate(['/tambah-mhs'], {
      state: { mahasiswa: mhs, isEdit: true }
    });
  }
}
