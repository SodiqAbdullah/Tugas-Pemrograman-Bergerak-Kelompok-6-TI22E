const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());

// ⚠️ Limit ditingkatkan ke 10mb untuk menerima foto base64
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const SECRET_KEY = "kunci_rahasia_akses";

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

// ========== MIDDLEWARE: Verifikasi Token JWT ==========
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
    req.user = decoded; // { id, username }
    next();
  });
};

// ========== 2. ENDPOINT REGISTER ==========
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi!' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err) => {
      if (err) return res.status(400).json({ error: 'Username sudah digunakan!' });
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
    if (results.length === 0) return res.status(401).json({ error: 'Username tidak ditemukan!' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) return res.status(401).json({ error: 'Password salah!' });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login Sukses', token, username: user.username, id: user.id });
  });
});

// ========== 4. SIMPAN DATA PATROLI (Protected) ==========
app.post('/api/patroli', verifyToken, (req, res) => {
  const { nama_lokasi, no_resi, latitude, longitude, jarak, status, foto } = req.body;

  if (!nama_lokasi || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Data patroli tidak lengkap!' });
  }

  const sql = `
    INSERT INTO patroli (id_petugas, nama_lokasi, no_resi, latitude, longitude, jarak, status, foto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    req.user.id,
    nama_lokasi,
    no_resi || '-',
    latitude,
    longitude,
    jarak || 0,
    status || 'Di Luar Jangkauan',
    foto || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error simpan patroli:', err);
      return res.status(500).json({ error: 'Gagal menyimpan data patroli.' });
    }
    res.json({
      message: 'Data patroli berhasil disimpan!',
      id: result.insertId
    });
  });
});

// ========== 5. AMBIL RIWAYAT PATROLI MILIK USER (Protected) ==========
app.get('/api/patroli', verifyToken, (req, res) => {
  const sql = `
    SELECT p.*, u.username 
    FROM patroli p
    JOIN users u ON p.id_petugas = u.id
    WHERE p.id_petugas = ?
    ORDER BY p.created_at DESC
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error('Error ambil patroli:', err);
      return res.status(500).json({ error: 'Gagal mengambil data patroli.' });
    }
    res.json(results);
  });
});

// ========== 6. AMBIL SEMUA RIWAYAT PATROLI (Protected, untuk admin) ==========
app.get('/api/patroli/semua', verifyToken, (req, res) => {
  const sql = `
    SELECT p.*, u.username 
    FROM patroli p
    JOIN users u ON p.id_petugas = u.id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error ambil semua patroli:', err);
      return res.status(500).json({ error: 'Gagal mengambil data.' });
    }
    res.json(results);
  });
});

// ========== START SERVER ==========
app.listen(3000, () => {
  console.log('🚀 Server GeoPatrol berjalan di http://localhost:3000');
  console.log('📌 Endpoint tersedia:');
  console.log('   POST /api/register');
  console.log('   POST /api/login');
  console.log('   POST /api/patroli        (butuh token) — simpan laporan');
  console.log('   GET  /api/patroli        (butuh token) — riwayat saya');
  console.log('   GET  /api/patroli/semua  (butuh token) — semua riwayat');
});