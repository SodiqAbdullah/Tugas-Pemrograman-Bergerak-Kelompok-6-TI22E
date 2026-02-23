const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "kunci_rahasia_akses"; // Kunci untuk validasi token

// ========== 1. KONEKSI DATABASE ==========
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',        // Ganti jika password MySQL Anda berbeda
  database: 'db_kampus'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Gagal koneksi ke MySQL:', err.message);
    return;
  }
  console.log('✅ Berhasil terhubung ke MySQL!');
});

// ========== 2. ENDPOINT REGISTER ==========
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi!' });
  }

  try {
    // Enkripsi password dengan Bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        return res.status(400).json({ error: 'Username sudah digunakan!' });
      }
      res.json({ message: 'Registrasi Berhasil!' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

// ========== 3. ENDPOINT LOGIN ==========
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi!' });
  }

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Kesalahan server.' });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Username tidak ditemukan!' });
    }

    const user = results[0];

    // Bandingkan password input dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password salah!' });
    }

    // Buat token JWT (berlaku 1 jam)
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login Sukses', token: token, username: user.username });
  });
});

// ========== 4. ENDPOINT CEK TOKEN (Protected Route) ==========
// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan! Silakan login.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid atau sudah kadaluarsa!' });
    }
    req.user = decoded;
    next();
  });
};

// Contoh route yang dilindungi token
app.get('/api/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Berhasil mengakses halaman rahasia!',
    user: req.user
  });
});

// ========== START SERVER ==========
app.listen(3000, () => {
  console.log('🚀 Server Auth berjalan di http://localhost:3000');
  console.log('📌 Endpoint tersedia:');
  console.log('   POST /api/register');
  console.log('   POST /api/login');
  console.log('   GET  /api/profile  (butuh token)');
});