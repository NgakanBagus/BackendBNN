const express = require('express');
const db = require('../db/system');
const router = express.Router();

// Mendapatkan semua jadwal
router.get('/', (req, res) => {
  db.all('SELECT * FROM jadwal', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows });
    }
  });
});

router.get('/:id_jadwal', (req, res) => {
  const { id_jadwal } = req.params;
  db.get('SELECT * FROM jadwal WHERE id_jadwal = ?', [id_jadwal], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Jadwal not found' });
    } else {
      res.json(row);
    }
  });
});

// Menambahkan jadwal baru
router.post('/', (req, res) => {
  const { nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai } = req.body;
  db.run(
    'INSERT INTO jadwal (nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?)',
    [nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        res.json({ message: 'Jadwal created!', id_jadwal: this.lastID });
      }
    }
  );
});

// Menghapus jadwal
router.delete('/:id_jadwal', (req, res) => {
  const { id_jadwal } = req.params;
  db.run('DELETE FROM jadwal WHERE id_jadwal = ?', [id_jadwal], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Jadwal not found' });
    } else {
      res.json({ message: 'Jadwal deleted' });
    }
  });
});

// Mengedit jadwal
router.put('/:id_jadwal', (req, res) => {
  const { id_jadwal } = req.params;
  const { nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai } = req.body;
  db.run(
    'UPDATE jadwal SET nama_kegiatan = ?, tanggal_mulai = ?, tanggal_selesai = ?, jam_mulai = ?, jam_selesai = ? WHERE id_jadwal = ?',
    [nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, id_jadwal],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Jadwal not found' });
      } else {
        res.json({ message: 'Jadwal updated' });
      }
    }
  );
});


module.exports = router;
