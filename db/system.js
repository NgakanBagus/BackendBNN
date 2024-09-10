const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Database setup
const db = new sqlite3.Database('./db/system.db');

db.serialize(async () => {
  // Drop tables if you need to start fresh (optional, use with caution)
  //db.run('DROP TABLE IF EXISTS jadwal');
  //db.run('DROP TABLE IF EXISTS laporan');
  //db.run('DROP TABLE IF EXISTS pengumuman');
  //db.run('DROP TABLE IF EXISTS user');
  //db.run('DROP TABLE IF EXISTS admin');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS jadwal (
      id_jadwal INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kegiatan VARCHAR(50) NOT NULL,
      tanggal_mulai DATE NOT NULL,
      tanggal_selesai DATE NOT NULL,
      jam_mulai TIME NOT NULL,
      jam_selesai TIME NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS laporan (
      id_laporan INTEGER PRIMARY KEY AUTOINCREMENT,
      id_jadwal INTEGER NOT NULL,
      tanggal_laporan DATE NOT NULL,
      FOREIGN KEY (id_jadwal) REFERENCES jadwal(id_jadwal)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pengumuman (
      id_pengumuman INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal_pengumuman DATE NOT NULL,
      deskripsi_pengumuman VARCHAR(500) NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id_user INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  db.run(`
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
    db.get(`SELECT * FROM admin WHERE username = ?`, [admin.username], async (err, row) => {
      if (err) {
        console.error(`Error querying admin ${admin.username}:`, err.message);
      } else if (!row) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        db.run(`INSERT INTO admin (username, password) VALUES (?, ?)`, [admin.username, hashedPassword], (err) => {
          if (err) {
            console.error(`Error inserting admin ${admin.username}:`, err.message);
          } else {
            console.log(`Admin ${admin.username} added to the database.`);
          }
        });
      } else {
        console.log(`Admin ${admin.username} already exists.`);
      }
    });
  }

  // Function to insert a user only if it doesn't already exist
  for (const user of initialUsers) {
    db.get(`SELECT * FROM user WHERE username = ?`, [user.username], async (err, row) => {
      if (err) {
        console.error(`Error querying user ${user.username}:`, err.message);
      } else if (!row) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        db.run(`INSERT INTO user (username, password) VALUES (?, ?)`, [user.username, hashedPassword], (err) => {
          if (err) {
            console.error(`Error inserting user ${user.username}:`, err.message);
          } else {
            console.log(`User ${user.username} added to the database.`);
          }
        });
      } else {
        console.log(`User ${user.username} already exists.`);
      }
    });
  }
});

module.exports = db;
