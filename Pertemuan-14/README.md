# Dana Kilat (Ionic + Capacitor)

aplikasi dompet yang bisa membuat QR merchant dan melakukan pembayaran lewat scan QR.

Fitur utama
- Scan QR untuk membayar merchant (menggunakan `@capacitor-mlkit/barcode-scanning`).
- Buat QR merchant (menggunakan `angularx-qrcode`).
- Menyimpan riwayat pembayaran sederhana dan saldo lokal pada halaman `Home`.

Struktur penting
- Halaman utama: `src/app/home` — scanner + log transaksi.
- Halaman merchant: `src/app/merchant` — form untuk membuat QR (nama merchant + harga).

Teknologi
- Ionic + Angular
- Capacitor (Android)
- Plugin barcode-scanning dari Capacitor MLKit

Prasyarat
- Node.js (versi LTS) dan `npm` atau `yarn`
- Ionic CLI: `npm install -g @ionic/cli`
- Capacitor CLI (opsional): `npm install -g @capacitor/cli` atau gunakan `npx`
- Java JDK & Android SDK, Android Studio (untuk build/debug Android)

Instalasi
1. Masuk ke folder proyek

2. Pasang dependensi:

```bash
npm install
```

3. (Opsional) Sinkronisasi Capacitor setelah perubahan pada `www`/build:

```bash
npx cap sync
```

Menjalankan aplikasi

Di browser (web):

```bash
ionic serve
```

Di perangkat Android dengan hot-reload (scan QR untuk live-reload):

```bash
ionic cap run android -l --external
```

Catatan live-reload (`--external`):
- Pastikan komputer dan perangkat Android berada dalam jaringan Wi‑Fi yang sama.
- Jika QR tidak dapat di-scan/terhubung, periksa firewall dan pastikan port yang ditampilkan terminal dapat diakses dari perangkat.
- Plugin scanner membutuhkan izin kamera; beri izin saat diminta.

Build/running tanpa live-reload

```bash
ionic build
npx cap copy android
npx cap open android
# lalu build/run dari Android Studio
```

Script yang tersedia (dari `package.json`)
- `npm start` → `ng serve`
- `npm run build` → `ng build`
- `npm test` → jalankan unit test (jika dikonfigurasi)

Troubleshooting cepat
- Scanner tidak aktif: pastikan izin kamera diberikan dan plugin `@capacitor-mlkit/barcode-scanning` terpasang.
- Perangkat tidak menemukan live-reload server: cek alamat IP di terminal, matikan VPN/firewall atau pakai kabel USB dan jalankan tanpa `--external`.
- Error build Android: pastikan `JAVA_HOME` dan `ANDROID_HOME` sudah diset dan Android SDK terinstal.

Keterangan tambahan
Jika Anda ingin, saya bisa menambahkan skrip npm shortcut seperti `npm run android:live` yang menjalankan perintah hot-reload, atau menambahkan instruksi untuk debugging di Android Studio.

