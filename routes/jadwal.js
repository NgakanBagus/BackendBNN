const express = require('express');
const db = require('../db/system'); // Pastikan file system.js menggunakan better-sqlite3 dengan benar
const router = express.Router();

// Mendapatkan semua jadwal
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM jadwal');
    const rows = stmt.all(); // Mengambil semua data dengan metode sinkron
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id_jadwal', (req, res) => {
  const { id_jadwal } = req.params;
  try {
    const stmt = db.prepare('SELECT * FROM jadwal WHERE id_jadwal = ?');
    const row = stmt.get(id_jadwal); // Mengambil satu data dengan metode sinkron
    if (!row) {
      res.status(404).json({ error: 'Jadwal not found' });
    } else {
      res.json(row);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Menambahkan jadwal baru
router.post('/', (req, res) => {
  const { nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai } = req.body;
  try {
    const stmt = db.prepare(
      'INSERT INTO jadwal (nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?)'
    );
    const info = stmt.run(nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai);
    res.json({ message: 'Jadwal created!', id_jadwal: info.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Menghapus jadwal
router.delete('/:id_jadwal', (req, res) => {
  const { id_jadwal } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM jadwal WHERE id_jadwal = ?');
    const info = stmt.run(id_jadwal);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Jadwal not found' });
    } else {
      res.json({ message: 'Jadwal deleted' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mengedit jadwal
router.put('/:id_jadwal', (req, res) => {
  const { id_jadwal } = req.params;
  const { nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai } = req.body;
  try {
    const stmt = db.prepare(
      'UPDATE jadwal SET nama_kegiatan = ?, tanggal_mulai = ?, tanggal_selesai = ?, jam_mulai = ?, jam_selesai = ? WHERE id_jadwal = ?'
    );
    const info = stmt.run(nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, id_jadwal);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Jadwal not found' });
    } else {
      res.json({ message: 'Jadwal updated' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
