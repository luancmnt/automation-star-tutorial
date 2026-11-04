const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'name, email, and password are required.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters.' });
  }

  if (db.findUserByEmail(email)) {
    return res.status(409).json({ error: 'A user with this email already exists.' });
  }

  const user = {
    id: uuidv4(),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
  };

  db.users.push(user);
  db.setCart(user.id, []);

  const token = uuidv4();
  db.sessions.set(token, { userId: user.id });

  return res.status(201).json({
    message: 'User registered successfully.',
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = uuidv4();
  db.sessions.set(token, { userId: user.id });

  return res.status(200).json({
    message: 'Login successful.',
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

module.exports = router;
