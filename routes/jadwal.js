const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('jadwal').select('*');
  
  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.json({ data });
  }
});

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

router.delete('/:id_jadwal', async (req, res) => {
  const { id_jadwal } = req.params;
  
  const { data, error } = await supabase
    .from('jadwal')
    .delete()
    .eq('id_jadwal', id_jadwal)
    .select();
  
  if (error) {
    res.status(400).json({ error: error.message });
  } else if (!data || data.length === 0) {
    res.status(404).json({ error: 'Jadwal not found' });
  } else {
    res.json({ message: 'Jadwal deleted', data });
  }
});

router.put('/:id_jadwal', async (req, res) => {
  const { id_jadwal } = req.params;
  const { nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai } = req.body;
  
  const { data, error } = await supabase
    .from('jadwal')
    .update({ nama_kegiatan, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai })
    .eq('id_jadwal', id_jadwal)
    .select(); 
  
  if (error) {
    res.status(400).json({ error: error.message });
  } else if (!data || data.length === 0) {
    res.status(404).json({ error: 'Jadwal not found' });
  } else {
    res.json({ message: 'Jadwal updated', data });
  }
});

module.exports = router;
