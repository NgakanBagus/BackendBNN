// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // To load environment variables

// Routes
const authRouter = require('./routes/auth');
const jadwalRouter = require('./routes/jadwal');
const laporanRouter = require('./routes/laporan');
const pengumumanRouter = require('./routes/pengumuman');

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Pass supabase client to the routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Define routes
app.use('/api/auth', authRouter);
app.use('/api/jadwal', jadwalRouter);
app.use('/api/laporan', laporanRouter);
app.use('/api/pengumuman', pengumumanRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
