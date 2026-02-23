-- Database untuk Ojek Siber Security Demo
-- Jalankan script ini di MySQL (XAMPP/MySQL Workbench)

-- Membuat database
CREATE DATABASE IF NOT EXISTS db_ojeksiber;
USE db_ojeksiber;

-- Membuat tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(50) NOT NULL,
  saldo INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menghapus data lama (jika ada) dan memasukkan data baru
TRUNCATE TABLE users;

INSERT INTO users (username, password, saldo) VALUES ('admin', 'rahasia123', 0);
INSERT INTO users (username, password, saldo) VALUES ('driver01', 'driver123', 50000);
INSERT INTO users (username, password, saldo) VALUES ('user02', 'user123', 25000);

-- Verifikasi data
SELECT * FROM users;
