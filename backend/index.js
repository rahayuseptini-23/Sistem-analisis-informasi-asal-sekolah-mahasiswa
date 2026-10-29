const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Database PostgreSQL menggunakan .env
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// Test Koneksi Database
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error connecting to PostgreSQL database:', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database!');
  release();
});

// 1. Beranda Portal TI C (Root Endpoint)
app.get('/', (req, res) => {
  res.json({ message: 'API Backend Ruang TI C - Asal Sekolah Mahasiswa is running successfully!' });
});

// 2. Login Admin (Sesuai skema halaman "Login admin")
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  // Contoh validasi admin (bisa disesuaikan dengan tabel admin di database jika diperlukan)
  if (username === 'admin_ti' && password === 'password123') {
    res.json({ success: true, message: 'Login admin berhasil', token: 'fake-jwt-token-ti-c' });
  } else {
    res.status(401).json({ success: false, message: 'Username atau password salah' });
  }
});

// 3. GET: Daftar Mahasiswa (Digunakan untuk "Daftar mahasiswa publik" & "Daftar mahasiswa admin")
app.get('/api/mahasiswa', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mahasiswa ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 4. GET: Detail Mahasiswa by ID (Digunakan untuk form "Edit data mahasiswa")
app.get('/api/mahasiswa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM mahasiswa WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data mahasiswa tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 5. POST: Tambah Mahasiswa Baru (Sesuai halaman "Tambah mahasiswa")
app.post('/api/mahasiswa', async (req, res) => {
  try {
    const { nim, nama, asal_sekolah } = req.body;
    const newMahasiswa = await pool.query(
      'INSERT INTO mahasiswa (nim, nama, asal_sekolah) VALUES ($1, $2, $3) RETURNING *',
      [nim, nama, asal_sekolah]
    );
    res.status(201).json({
      message: 'Data mahasiswa berhasil disimpan',
      data: newMahasiswa.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error / Gagal menyimpan data' });
  }
});

// 6. PUT: Update / Edit Data Mahasiswa (Sesuai halaman "Edit data mahasiswa")
app.put('/api/mahasiswa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nim, nama, asal_sekolah } = req.body;
    const updateMahasiswa = await pool.query(
      'UPDATE mahasiswa SET nim = $1, nama = $2, asal_sekolah = $3 WHERE id = $4 RETURNING *',
      [nim, nama, asal_sekolah, id]
    );
    if (updateMahasiswa.rows.length === 0) {
      return res.status(404).json({ error: 'Data mahasiswa tidak ditemukan' });
    }
    res.json({
      message: 'Perubahan tersimpan / Data mahasiswa berhasil diperbarui',
      data: updateMahasiswa.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 7. DELETE: Hapus Mahasiswa (Sesuai pop-up "Konfirmasi hapus mahasiswa")
app.delete('/api/mahasiswa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteMahasiswa = await pool.query('DELETE FROM mahasiswa WHERE id = $1 RETURNING *', [id]);
    if (deleteMahasiswa.rows.length === 0) {
      return res.status(404).json({ error: 'Data mahasiswa tidak ditemukan' });
    }
    res.json({ message: 'Data mahasiswa berhasil dihapus' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Jalankan Server
app.listen(port, () => {
  console.log(`Server Ruang TI C is running on http://localhost:${port}`);
});