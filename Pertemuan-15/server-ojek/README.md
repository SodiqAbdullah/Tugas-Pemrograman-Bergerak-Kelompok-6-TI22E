# Ojek Siber - Security Demo

Project ini berisi demo keamanan aplikasi mobile untuk praktikum Pemrograman Bergerak.

## Struktur Project

```
latihan/
├── server-ojek/           # Backend Node.js Express
│   ├── server.js          # Server utama
│   ├── package.json       # Dependencies
│   └── setup-database.sql # Script database MySQL
└── src/                   # Frontend Ionic
    └── app/home/          # Halaman demo security
```

## Cara Menjalankan

### 1. Setup Database MySQL
1. Buka XAMPP atau MySQL Workbench
2. Import file `setup-database.sql`
3. Pastikan MySQL berjalan di port 3306

### 2. Jalankan Backend
```
bash
cd server-ojek
npm install
node server.js
```
Server akan berjalan di http://localhost:3000

### 3. Jalankan Frontend Ionic
```
bash
# Di terminal lain
ionic serve
```

## Fitur Demo

### 1. SQL Injection Login
- **Vulnerable**: Coba username `admin' --` tanpa password
- **Secure**: Menggunakan parameterized query

### 2. Deteksi Fake GPS
- Toggle "Fake GPS" untuk simulasi
- Server mendeteksi jika isMock = true

### 3. Server-Side Validation
- Demo topup saldo dengan validasi di server
- Client tidak bisa memanipulasi nominal

##.user
- admin / rahasia123
- driver01 / driver123
- user02 / user123
