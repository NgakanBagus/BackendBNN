const express = require('express');
const router = express.Router();
const db = require('../db/system');

// Mendapatkan semua pengumuman
router.get('/', (req, res) => {
  db.all('SELECT * FROM pengumuman', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Mendapatkan pengumuman berdasarkan ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM pengumuman WHERE id_pengumuman = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Menambahkan pengumuman baru
router.post('/', (req, res) => {
  console.log("Menerima POST request ke /api/pengumuman");
  const { tanggal_pengumuman, deskripsi_pengumuman } = req.body;
  if (!tanggal_pengumuman || !deskripsi_pengumuman) {
    res.status(400).json({ error: "Tanggal dan Deskripsi Pengumuman wajib diisi." });
    return;
  }

  db.run(
    'INSERT INTO pengumuman (tanggal_pengumuman, deskripsi_pengumuman) VALUES (?, ?)',
    [tanggal_pengumuman, deskripsi_pengumuman],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      // Return the ID of the newly inserted row
      res.status(201).json({ id: this.lastID });
    }
  );
});


// Menghapus pengumuman
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM pengumuman WHERE id_pengumuman = ?', [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
