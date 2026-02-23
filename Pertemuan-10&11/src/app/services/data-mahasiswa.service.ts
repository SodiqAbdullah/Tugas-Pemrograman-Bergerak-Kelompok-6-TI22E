import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences'; // 1. Import Preferences

@Injectable({
  providedIn: 'root'
})
export class DataMahasiswaService {

  // Kunci penyimpanan (ibarat nama laci)
  private KEY_MAHASISWA = 'data_mahasiswa_app';

  constructor() { }

  // FUNGSI 1: Membaca Data
  async getData() {
    // Ambil data mentah dari penyimpanan
    const { value } = await Preferences.get({ key: this.KEY_MAHASISWA });

    // Jika ada datanya, kembalikan dalam bentuk Objek (JSON Parse)
    // Jika kosong, kembalikan array kosong []
    return value ? JSON.parse(value) : [];
  }

  // FUNGSI 2: Menambah Data Baru
  async tambahData(mahasiswaBaru: any) {
    // 1. Ambil data lama dulu
    const dataLama = await this.getData();

    // 2. Tambahkan data baru ke array data lama
    // (Beri ID otomatis berdasarkan timestamp agar unik)
    mahasiswaBaru.id = Date.now();
    dataLama.push(mahasiswaBaru);

    // 3. Simpan kembali ke Preferences dalam bentuk String (JSON Stringify)
    return await Preferences.set({
      key: this.KEY_MAHASISWA,
      value: JSON.stringify(dataLama)
    });
  }

  // FUNGSI 3: Menghapus Data
  async hapusData(id: number) {
    // 1. Ambil data lama dulu
    const dataLama = await this.getData();

    // 2. Filter data, hapus yang id-nya sesuai
    const dataBaru = dataLama.filter((mhs: any) => mhs.id !== id);

    // 3. Simpan kembali ke Preferences
    return await Preferences.set({
      key: this.KEY_MAHASISWA,
      value: JSON.stringify(dataBaru)
    });
  }

  // FUNGSI 4: Mengedit Data
  async editData(id: number, mahasiswaUpdate: any) {
    // 1. Ambil data lama dulu
    const dataLama = await this.getData();

    // 2. Cari index data yang akan diedit
    const index = dataLama.findIndex((mhs: any) => mhs.id === id);

    if (index !== -1) {
      // 3. Update data
      dataLama[index] = { ...dataLama[index], ...mahasiswaUpdate };

      // 4. Simpan kembali ke Preferences
      return await Preferences.set({
        key: this.KEY_MAHASISWA,
        value: JSON.stringify(dataLama)
      });
    }
  }
}
