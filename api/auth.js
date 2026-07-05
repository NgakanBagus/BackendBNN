const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const SECRET_KEY = 'bnn1234';

// Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log("SUPABASE_URL =", supabaseUrl);
console.log("SUPABASE_KEY exists =", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Admin lookup
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .limit(1); // This now returns an array

    if (adminError) {
      console.error("Admin Query Error:", adminError);
      return res.status(500).json(adminError);
    }

    if (admins && admins.length > 0) {
      const admin = admins[0]; // Take the first result from the array
      const isPasswordMatch = await bcrypt.compare(password, admin.password);
      if (isPasswordMatch) {
        const token = jwt.sign({ id: admin.id, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token, role: 'admin' });
      }
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // User lookup
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError && userError.message !== 'No rows found') {
      console.error("User Query Error:", userError.message); // Log the error
      return res.status(500).json({ error: userError.message });
    }

    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        const token = jwt.sign({ id: user.id, role: 'user' }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token, role: 'user' });
      }
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    console.error('Unexpected Server Error:', err.message);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

module.exports = router;
