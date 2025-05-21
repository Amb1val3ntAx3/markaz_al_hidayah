const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// Redirect /index.html to /
app.get('/index.html', (req, res) => {
  res.redirect('/');
});

// Clean URL for /naxwah -> serve pages/naxwah/naxwah.html
app.get('/naxwah', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'naxwah', 'naxwah.html'));
});

// Clean URL for /tafseer -> serve pages/tafseer/tafseer.html
app.get('/tafseer', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'tafseer', 'tafseer.html'));
});

// You can add more routes here for other pages like /admin etc.
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'admin', 'admin.js')); // If this is a HTML page, adjust accordingly
});

// Handle JSON updates API route
app.post('/update-json', (req, res) => {
  const { type, name, audio, image, password } = req.body;

  // Password check (change "123" for production)
  if (password !== "123") return res.status(403).json({ error: "Forbidden" });

  const jsonPath = path.join(__dirname, 'storage', `${type}.json`);

  try {
    // Read existing data
    const data = fs.existsSync(jsonPath)
      ? JSON.parse(fs.readFileSync(jsonPath))
      : [];

    // Add new entry
    data.push({ name, audio, image });

    // Save file
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    res.json({ success: true });
  } catch (error) {
    console.error("JSON update error:", error);
    res.status(500).json({ error: "Failed to update" });
  }
});

// Default fallback for other URLs - optional
// You can serve 404 or redirect to homepage here if you want

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
