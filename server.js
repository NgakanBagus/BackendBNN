const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/auth');
const jadwalRouter = require('./routes/jadwal');
const laporanRouter = require('./routes/laporan');
const pengumumanRouter = require('./routes/pengumuman');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRouter);
app.use('/api/jadwal', jadwalRouter);
app.use('/api/laporan', laporanRouter);
app.use('/api/pengumuman', pengumumanRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
