const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Koneksi Database MySQL
// Ganti dengan konfigurasi MySQL Anda
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_ojeksiber'
});

// Cek koneksi database
db.connect((err) => {
  if (err) {
    console.log('Koneksi database gagal: ' + err.message);
  } else {
    console.log('Terhubung ke database MySQL');
  }
});

// MIDDLEWARE FORENSIK (Mencatat Jejak Digital)
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const timestamp = new Date().toISOString();

  console.log(`[FORENSIC LOG] TIME: ${timestamp} | IP: ${ip} | DEVICE: ${userAgent} | PATH: ${req.path}`);
  next(); // Lanjut ke proses berikutnya
});

// 1. LOGIN TIDAK AMAN (Vulnerable to SQL Injection)
// Coba login dengan username: admin' --
app.post('/api/login-vulnerable', (req, res) => {
  const { username, password } = req.body;
  
  // BAHAYA: Menggabungkan string secara langsung!
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  console.log(`[VULNERABLE] Query: ${query}`);

  db.query(query, (err, results) => {
    if (err) {
      console.log('[ERROR] ' + err.message);
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      res.json({ message: "LOGIN BERHASIL (Vulnerable)", user: results[0] });
    } else {
      res.status(401).json({ message: "Login Gagal" });
    }
  });
});

// 2. LOGIN AMAN (Secure)
app.post('/api/login-secure', (req, res) => {
  const { username, password } = req.body;
  
  // AMAN: Menggunakan tanda tanya (?) sebagai placeholder
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

  console.log(`[SECURE] Query with parameterized values: ${username}, ${password}`);

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.log('[ERROR] ' + err.message);
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      res.json({ message: "LOGIN BERHASIL (Secure)", user: results[0] });
    } else {
      res.status(401).json({ message: "Login Gagal" });
    }
  });
});

// 3. DETEKSI FAKE GPS (Logic Server)
app.post('/api/absen-lokasi', (req, res) => {
  const { lat, lng, isMock } = req.body;
  const ip = req.socket.remoteAddress;

  // Analisis Forensik Sederhana
  if (isMock === true) {
    console.log(`[ALERT] FAKE GPS DETECTED from IP: ${ip} | Lat: ${lat}, Lng: ${lng}`);
    return res.status(403).json({ message: "DILARANG MENGGUNAKAN TUYUL (Fake GPS)!" });
  }

  console.log(`[OK] Valid GPS Location from IP: ${ip} | Lat: ${lat}, Lng: ${lng}`);
  res.json({ message: "Absen Lokasi Berhasil Diterima" });
});

// 4. TOPUP SALDO (Server-Side Validation)
app.post('/api/topup', (req, res) => {
  const { userId, requestedAmount } = req.body;
  
  // SERVER-SIDE VALIDATION - Server yang menentukan jumlah saldo
  // Jangan pernah percaya client-side data untuk nilai uang!
  
  // Contoh: validasi bahwa request topup harus melalui proses verifikasi
  const validAmounts = [10000, 20000, 50000, 100000, 200000, 500000];
  
  if (!validAmounts.includes(requestedAmount)) {
    console.log(`[ALERT] Suspicious topup request from user ${userId}: ${requestedAmount}`);
    return res.status(400).json({ message: "Jumlah topup tidak valid! Gunakan nominal yang tersedia." });
  }

  console.log(`[OK] Topup request accepted for user ${userId}: ${requestedAmount}`);
  res.json({ 
    message: "Topup berhasil diproses",
    amount: requestedAmount,
    adminVerified: true // Bukti bahwa server yang memvalidasi
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Server OjekSiber berjalan di port ' + PORT);
});
