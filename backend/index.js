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

// 2. Login Admin (Mengambil data langsung dari tabel `admin` di database)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM admin WHERE username = $1 AND password = $2', [username, password]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }
    
    res.json({ success: true, message: 'Login admin berhasil', token: 'fake-jwt-token-ti-c' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 3. GET: Daftar Mahasiswa (Menggunakan JOIN ke tabel `asal_sekolah`)
app.get('/api/mahasiswa', async (req, res) => {
  try {
    const query = `
      SELECT m.id, m.nim, m.nama_mahasiswa, s.id AS id_sekolah, s.nama_sekolah, s.jenis_sekolah, s.kabupaten
      FROM mahasiswa m
      LEFT JOIN asal_sekolah s ON m.id_sekolah = s.id
      ORDER BY m.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 4. GET: Detail Mahasiswa by ID (Menggunakan JOIN)
app.get('/api/mahasiswa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT m.id, m.nim, m.nama_mahasiswa, s.id AS id_sekolah, s.nama_sekolah, s.jenis_sekolah, s.kabupaten
      FROM mahasiswa m
      LEFT JOIN asal_sekolah s ON m.id_sekolah = s.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data mahasiswa tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 5. POST: Tambah Mahasiswa Baru (Menggunakan id_sekolah)
app.post('/api/mahasiswa', async (req, res) => {
  try {
    const { nim, nama_mahasiswa, id_sekolah } = req.body;
    const newMahasiswa = await pool.query(
      'INSERT INTO mahasiswa (nim, nama_mahasiswa, id_sekolah) VALUES ($1, $2, $3) RETURNING *',
      [nim, nama_mahasiswa, id_sekolah]
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

// 6. PUT: Update / Edit Data Mahasiswa
app.put('/api/mahasiswa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nim, nama_mahasiswa, id_sekolah } = req.body;
    const updateMahasiswa = await pool.query(
      'UPDATE mahasiswa SET nim = $1, nama_mahasiswa = $2, id_sekolah = $3 WHERE id = $4 RETURNING *',
      [nim, nama_mahasiswa, id_sekolah, id]
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

// 7. DELETE: Hapus Mahasiswa
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