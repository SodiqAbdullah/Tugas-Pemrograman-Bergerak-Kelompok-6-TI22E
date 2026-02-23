-- Jalankan query ini di phpMyAdmin atau HeidiSQL (Laragon)
-- Pastikan database db_kampus sudah ada sebelumnya

-- Gunakan database
USE db_kampus;

-- Buat tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verifikasi tabel berhasil dibuat
SELECT 'Tabel users berhasil dibuat!' AS status;