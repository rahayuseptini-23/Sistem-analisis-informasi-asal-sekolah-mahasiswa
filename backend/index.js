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

// Endpoint Utama (Testing)
app.get('/', (req, res) => {
  res.json({ message: 'API Backend Asal Sekolah Mahasiswa is running successfully!' });
});

// Contoh Endpoint untuk mengambil data asal sekolah (sesuaikan dengan tabel database kalian nanti)
app.get('/api/asal-sekolah', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM asal_sekolah'); // Ganti 'asal_sekolah' dengan nama tabel aslimu
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Jalankan Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});