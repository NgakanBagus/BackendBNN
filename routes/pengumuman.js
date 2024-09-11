const express = require('express');
const router = express.Router();
const db = require('../db/system');

// Mendapatkan semua pengumuman
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM pengumuman').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mendapatkan pengumuman berdasarkan ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  try {
    const row = db.prepare('SELECT * FROM pengumuman WHERE id_pengumuman = ?').get(id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Menambahkan pengumuman baru
router.post('/', (req, res) => {
  const { tanggal_pengumuman, deskripsi_pengumuman } = req.body;
  if (!tanggal_pengumuman || !deskripsi_pengumuman) {
    res.status(400).json({ error: "Tanggal dan Deskripsi Pengumuman wajib diisi." });
    return;
  }

  try {
    const result = db.prepare(
      'INSERT INTO pengumuman (tanggal_pengumuman, deskripsi_pengumuman) VALUES (?, ?)'
    ).run(tanggal_pengumuman, deskripsi_pengumuman);
    
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Menghapus pengumuman
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  try {
    const result = db.prepare('DELETE FROM pengumuman WHERE id_pengumuman = ?').run(id);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
