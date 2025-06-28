require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const GH_TOKEN = process.env.GH_TOKEN;
const GH_REPO = process.env.GH_REPO; // format: https://github.com/username/repo.git

// === Middleware ===
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// === Auto Commit Function ===
function autoCommitToGitHub(commitMessage = 'Auto JSON update') {
  if (!GH_TOKEN || !GH_REPO) {
    console.log('❌ GH_TOKEN or GH_REPO not set.');
    return;
  }

  const authenticatedRepo = GH_REPO.replace('https://', `https://${GH_TOKEN}@`);

  exec('git add storage/*.json', (err) => {
    if (err) return console.error('git add error:', err);

    exec(`git commit -m "${commitMessage}"`, (err) => {
      if (err) return console.error('git commit error (possibly no changes):', err.message);

      exec(`git push "${authenticatedRepo}" HEAD:main`, (err, stdout, stderr) => {
        if (err) return console.error('git push error:', err.message);
        console.log('✅ Changes pushed to GitHub.');
      });
    });
  });
}

// === Routes ===

// Redirect /index.html to /
app.get('/index.html', (req, res) => res.redirect('/'));

// Serve pages
const pages = ['naxwah', 'tafseer', 'admin'];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', page, `${page}.html`));
  });
});

// === Password Verification ===
app.post('/verify-password', (req, res) => {
  const { password } = req.body;
  res.json({ success: password === ADMIN_PASSWORD });
});

// === Update JSON ===
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
    const existingData = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : [];

    existingData.push({ name, audio, image });

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
    console.log(`✅ ${type}.json updated.`);

    // Push to GitHub
    autoCommitToGitHub(`Update ${type}.json: ${name}`);

    res.json({ success: true, message: 'Content added and committed to GitHub.' });
  } catch (error) {
    console.error('❌ Failed to update JSON:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
