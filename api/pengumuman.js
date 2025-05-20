const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://nbcnhzkctgrnojhhbvqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ra3Fibm9qdnJsY2t4a3F2Z2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcxMjg2MiwiZXhwIjoyMDYzMjg4ODYyfQ.aFClYNB48sdDekmlZ8QCW1mS2IUxQj0NeR9i2R3Ftfk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mendapatkan semua pengumuman
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pengumuman') // Assuming the table is named 'pengumuman'
      .select('*');
    
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Mendapatkan pengumuman berdasarkan ID
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
      .single();  // Use single to fetch one record
    
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching pengumuman by ID:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Menambahkan pengumuman baru
router.post('/', async (req, res) => {
  console.log("Menerima POST request ke /api/pengumuman", req.body);
  const { tanggal_pengumuman, deskripsi_pengumuman } = req.body;

  // Validate the incoming data
  if (!tanggal_pengumuman || !deskripsi_pengumuman) {
    return res.status(400).json({ error: "Tanggal dan Deskripsi Pengumuman wajib diisi." });
  }

  try {
    const { data, error } = await supabase
      .from('pengumuman')
      .insert([{ tanggal_pengumuman, deskripsi_pengumuman }])
      .select('id_pengumuman'); // Ensure you return the ID from the insertion
    
    if (error) throw error;

    console.log("Inserted data:", data);

    // Check if data exists
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

// Menghapus jadwal
router.delete('/:id_pengumuman', async (req, res) => {
  const { id_pengumuman } = req.params;
  
  const { data, error } = await supabase
    .from('pengumuman')
    .delete()
    .eq('id_pengumuman', id_pengumuman)
    .select(); // Pastikan kita mendapatkan data yang dihapus
  
  if (error) {
    res.status(400).json({ error: error.message });
  } else if (!data || data.length === 0) {
    res.status(404).json({ error: 'Pengumuman not found' });
  } else {
    res.json({ message: 'Pengumuman deleted', data });
  }
});

module.exports = router;
