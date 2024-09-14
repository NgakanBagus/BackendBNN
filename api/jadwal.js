const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const SUPABASE_URL = 'https://nbcnhzkctgrnojhhbvqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY25oemtjdGdybm9qaGhidnFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjAyMjE1MCwiZXhwIjoyMDQxNTk4MTUwfQ.l17K7F3hOq8dnZGSOFNVHnRc95uZEyMoNS8mH8HOxB8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mendapatkan semua jadwal
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('jadwal').select('*');
  
  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.json({ data });
  }
});

// Mendapatkan jadwal berdasarkan ID
router.get('/:id_jadwal', async (req, res) => {
  const { id_jadwal } = req.params;
  
  const { data, error } = await supabase
    .from('jadwal')
    .select('*')
    .eq('id_jadwal', id_jadwal)
    .single();
  
  if (error) {
    res.status(500).json({ error: error.message });
  } else if (!data) {
    res.status(404).json({ error: 'Jadwal not found' });
  } else {
    res.json(data);
  }
});

// Menambahkan jadwal baru
router.post('/', async (req, res) => {
  const { nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai } = req.body;
  
  const { data, error } = await supabase
    .from('jadwal')
    .insert([{ nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai }]);
  
  if (error) {
    res.status(400).json({ error: error.message });
  } else {
    res.json({ message: 'Jadwal created!', data });
  }
});

// Menghapus jadwal
router.delete('/:id_jadwal', async (req, res) => {
  const { id_jadwal } = req.params;
  
  const { data, error } = await supabase
    .from('jadwal')
    .delete()
    .eq('id_jadwal', id_jadwal)
    .select(); // Pastikan kita mendapatkan data yang dihapus
  
  if (error) {
    res.status(400).json({ error: error.message });
  } else if (!data || data.length === 0) {
    res.status(404).json({ error: 'Jadwal not found' });
  } else {
    res.json({ message: 'Jadwal deleted', data });
  }
});

// Mengedit jadwal
router.put('/:id_jadwal', async (req, res) => {
  const { id_jadwal } = req.params;
  const { nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai } = req.body;
  
  const { data, error } = await supabase
    .from('jadwal')
    .update({ nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai })
    .eq('id_jadwal', id_jadwal)
    .select(); // Pastikan kita mendapatkan data yang diupdate
  
  if (error) {
    res.status(400).json({ error: error.message });
  } else if (!data || data.length === 0) {
    res.status(404).json({ error: 'Jadwal not found' });
  } else {
    res.json({ message: 'Jadwal updated', data });
  }
});

module.exports = router;
