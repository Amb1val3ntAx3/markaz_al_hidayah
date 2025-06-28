require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// === Middleware ===
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// === Routes ===

// Redirect /index.html to /
app.get('/index.html', (req, res) => {
  res.redirect('/');
});

// Serve clean URL pages
app.get('/naxwah', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'naxwah', 'naxwah.html'));
});

app.get('/tafseer', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'tafseer', 'tafseer.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'admin', 'admin.html'));
});

// === API Endpoints ===

// Check password (for frontend)
app.post('/verify-password', (req, res) => {
  const { password } = req.body;
  return res.json({ success: password === ADMIN_PASSWORD });
});

// Optional login route
app.post('/admin-login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Unauthorized' });
});

// Update JSON content
app.post('/update-json', (req, res) => {
  const { password, type, name, audio, image } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!type || !name || !audio) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const dirPath = path.join(__dirname, 'storage');
  const filePath = path.join(dirPath, `${type}.json`);

  console.log(`Attempting to write to: ${filePath}`);

  try {
    // Ensure storage directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Read existing data or initialize with empty array
    const data = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      : [];

    // Add new entry
    data.push({ name, audio, image });

    // Save updated file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    console.log('✅ JSON updated successfully');
    return res.json({ success: true, message: 'Content added successfully' });

  } catch (error) {
    console.error('❌ JSON update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update JSON', error: error.message });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
