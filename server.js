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
const GH_REPO = process.env.GH_REPO; // e.g. https://github.com/yourusername/yourrepo.git

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Auto GitHub Commit
function autoCommitToGitHub(commitMessage = 'Auto update') {
  if (!GH_TOKEN || !GH_REPO) {
    console.log('❌ GH_TOKEN or GH_REPO missing.');
    return;
  }

  const authenticatedRepo = GH_REPO.replace('https://', `https://${GH_TOKEN}@`);

  // Set Git config locally in this repo
  const configCmd = `git config user.name "Amb1val3ntAx3" && git config user.email "ambivalentaxe@gmail.com"`;

  exec(configCmd, (err) => {
    if (err) return console.error('⚠️ Git config failed:', err.message);

    exec('git add storage/*.json', (err) => {
      if (err) return console.error('⚠️ Git add failed:', err.message);

      exec(`git commit -m "${commitMessage}"`, (err) => {
        if (err) return console.error('⚠️ Git commit failed (maybe no changes):', err.message);

        exec(`git push "${authenticatedRepo}" HEAD:main`, (err) => {
          if (err) return console.error('⚠️ Git push failed:', err.message);
          console.log('✅ Pushed to GitHub successfully.');
        });
      });
    });
  });
}

// Routes

// Redirect index.html
app.get('/index.html', (req, res) => res.redirect('/'));

// Serve pages
['naxwah', 'tafseer', 'admin','fiqh', 'hadith'].forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', page, `${page}.html`));
  });
});


// Verify Admin Password
app.post('/verify-password', (req, res) => {
  const { password } = req.body;
  res.json({ success: password === ADMIN_PASSWORD });
});

// JSON Upload Route
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
    console.log(`✅ ${type}.json updated with "${name}"`);

    autoCommitToGitHub(`Update ${type}.json: ${name}`);
    res.json({ success: true, message: 'Content added and committed.' });
  } catch (err) {
    console.error('❌ JSON write error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
