import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonItem, IonInput, IonButton, IonText, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { Router } from '@angular/router'; // Import Router
import { DataMahasiswaService } from '../services/data-mahasiswa.service'; // Import Service

@Component({
  selector: 'app-tambah-mhs',
  templateUrl: './tambah-mhs.page.html',
  styleUrls: ['./tambah-mhs.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonItem, IonInput, IonButton, IonText, IonSelect, IonSelectOption,
    CommonModule, FormsModule, ReactiveFormsModule
  ]
})
export class TambahMhsPage implements OnInit {

  // Variabel untuk menampung form
  formMahasiswa!: FormGroup;

  // Variabel untuk mode edit
  isEditMode: boolean = false;
  editingMahasiswa: any = null;

  // PERBAIKAN DI SINI: Inject Service dan Router ke Constructor
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataMahasiswaService, // <--- Service Data
    private router: Router                     // <--- Service Router (Pindah Halaman)
  ) { }

  ngOnInit() {
    // Inisialisasi Form
    this.formMahasiswa = this.formBuilder.group({
      nama: ['', [Validators.required, Validators.minLength(3)]],
      nim: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], // Hanya angka
      jurusan: ['', [Validators.required]]
    });

    // Cek apakah ada data untuk edit dari navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      if (state.isEdit && state.mahasiswa) {
        this.isEditMode = true;
        this.editingMahasiswa = state.mahasiswa;
        this.formMahasiswa.patchValue({
          nama: state.mahasiswa.nama,
          nim: state.mahasiswa.nim,
          jurusan: state.mahasiswa.jurusan
        });
      }
    }
  }

  // Fungsi yang dipanggil saat tombol Simpan diklik
  // PERBAIKAN: Tambahkan 'async' karena penyimpanan butuh waktu
  async simpanData() {
    if (this.formMahasiswa.valid) {

      if (this.isEditMode) {
        // Mode edit
        await this.dataService.editData(this.editingMahasiswa.id, this.formMahasiswa.value);
        alert('Data Berhasil Diupdate!');
      } else {
        // Mode tambah
        await this.dataService.tambahData(this.formMahasiswa.value);
        alert('Data Berhasil Disimpan!');
      }

      // 2. Tampilkan pesan sukses
      console.log('Data Disimpan:', this.formMahasiswa.value);

      // 3. Reset Form & Kembali ke Halaman Home
      this.formMahasiswa.reset();
      this.router.navigateByUrl('/home');

    } else {
      console.log('Form tidak valid');
      this.markFormGroupTouched(this.formMahasiswa); // Agar error merah muncul
    }
  }

  // Helper agar error muncul semua jika user memaksa klik submit
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
