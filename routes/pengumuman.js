const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pengumuman') 
      .select('*');
    
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "ID Pengumuman is required." });
  }
  
  try {
    const { data, error } = await supabase
      .from('pengumuman')
      .select('*')
      .eq('id_pengumuman', id)
      .single();  
    
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching pengumuman by ID:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  console.log("Menerima POST request ke /api/pengumuman", req.body);
  const { tanggal_pengumuman, deskripsi_pengumuman } = req.body;

  if (!tanggal_pengumuman || !deskripsi_pengumuman) {
    return res.status(400).json({ error: "Tanggal dan Deskripsi Pengumuman wajib diisi." });
  }

  try {
    const { data, error } = await supabase
      .from('pengumuman')
      .insert([{ tanggal_pengumuman, deskripsi_pengumuman }])
      .select('id_pengumuman'); 
    
    if (error) throw error;

    console.log("Inserted data:", data);

    if (data && data.length > 0) {
      res.status(201).json({ id: data[0].id_pengumuman });
    } else {
      throw new Error('Failed to insert data');
    }
  } catch (error) {
    console.error('Error inserting data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id_pengumuman', async (req, res) => {
  const { id_pengumuman } = req.params;
  
  const { data, error } = await supabase
    .from('pengumuman')
    .delete()
    .eq('id_pengumuman', id_pengumuman)
    .select(); 
  
  if (error) {
    res.status(400).json({ error: error.message });
  } else if (!data || data.length === 0) {
    res.status(404).json({ error: 'Pengumuman not found' });
  } else {
    res.json({ message: 'Pengumuman deleted', data });
  }
});

module.exports = router;
