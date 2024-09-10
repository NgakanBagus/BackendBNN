const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/system');

const router = express.Router();
const SECRET_KEY = 'bnn1234';

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check in admin table first
  db.get(`SELECT * FROM admin WHERE username = ?`, [username], (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (user) {
      // If user found in admin table, verify password
      if (bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: 'admin' });
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
    } else {
      // If not found in admin, check in user table
      db.get(`SELECT * FROM user WHERE username = ?`, [username], (err, user) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else if (user && bcrypt.compareSync(password, user.password)) {
          const token = jwt.sign({ id: user.id, role: 'user' }, SECRET_KEY, { expiresIn: '1h' });
          res.json({ token, role: 'user' });
        } else {
          res.status(401).json({ error: 'Invalid username or password' });
        }
      });
    }
  });
});

module.exports = router;
