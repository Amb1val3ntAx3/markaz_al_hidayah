require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// === ROUTES ===

// Redirect /index.html to /
app.get('/index.html', (req, res) => {
  res.redirect('/');
});

// Serve clean URLs
app.get('/naxwah', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'naxwah', 'naxwah.html'));
});

app.get('/tafseer', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'tafseer', 'tafseer.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'admin', 'admin.html'));
});

// === API ENDPOINTS ===

// Verify Admin Password
app.post('/verify-password', (req, res) => {
  const { password } = req.body;
  res.json({ success: password === ADMIN_PASSWORD });
});

// Admin Login (not used by frontend but kept for possible expansion)
app.post('/admin-login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

// Handle JSON update requests
app.post('/update-json', (req, res) => {
  const { password, type, name, audio, image } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!type || !name || !audio) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const filePath = path.join(__dirname, 'storage', `${type}.json`);

  try {
    const data = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath))
      : [];

    data.push({ name, audio, image });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({ success: true, message: 'Content added successfully' });
  } catch (error) {
    console.error('JSON update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update JSON' });
  }
});

// === SERVER START ===
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
