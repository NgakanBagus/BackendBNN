const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Database setup
const db = new sqlite3('./db/system.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS jadwal (
    id_jadwal INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_kegiatan VARCHAR(50) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS laporan (
    id_laporan INTEGER PRIMARY KEY AUTOINCREMENT,
    id_jadwal INTEGER NOT NULL,
    tanggal_laporan DATE NOT NULL,
    FOREIGN KEY (id_jadwal) REFERENCES jadwal(id_jadwal)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS pengumuman (
    id_pengumuman INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal_pengumuman DATE NOT NULL,
    deskripsi_pengumuman VARCHAR(500) NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id_user INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);

// Insert initial admin and user
const initialAdmins = [{ username: 'admin1', password: 'admin1234' }];
const initialUsers = [{ username: 'user1', password: 'user1234' }];

// Function to insert an admin only if it doesn't already exist
for (const admin of initialAdmins) {
  const row = db.prepare(`SELECT * FROM admin WHERE username = ?`).get(admin.username);
  if (!row) {
    const hashedPassword = bcrypt.hashSync(admin.password, 10);
    db.prepare(`INSERT INTO admin (username, password) VALUES (?, ?)`).run(admin.username, hashedPassword);
    console.log(`Admin ${admin.username} added to the database.`);
  } else {
    console.log(`Admin ${admin.username} already exists.`);
  }
}

// Function to insert a user only if it doesn't already exist
for (const user of initialUsers) {
  const row = db.prepare(`SELECT * FROM user WHERE username = ?`).get(user.username);
  if (!row) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    db.prepare(`INSERT INTO user (username, password) VALUES (?, ?)`).run(user.username, hashedPassword);
    console.log(`User ${user.username} added to the database.`);
  } else {
    console.log(`User ${user.username} already exists.`);
  }
}

module.exports = db;
