require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Middleware
app.use(express.json());

// Enable CORS for your frontend domain
app.use(cors({
    origin: 'https://markazalhidayah.com', // or use '*' if you want to allow all origins (less secure)
}));

// Serve static files (if needed)
app.use(express.static(path.join(__dirname)));

// Routes to serve your pages
app.get('/index.html', (req, res) => res.redirect('/'));
app.get('/naxwah', (req, res) => res.sendFile(path.join(__dirname, 'pages', 'naxwah', 'naxwah.html')));
app.get('/tafseer', (req, res) => res.sendFile(path.join(__dirname, 'pages', 'tafseer', 'tafseer.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'pages', 'admin', 'admin.html')));

// Verify password endpoint
app.post('/verify-password', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Update JSON endpoint
app.post('/update-json', (req, res) => {
    const { password, type, name, audio, image } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!['naxwe', 'tafsir'].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid content type" });
    }

    const jsonPath = path.join(__dirname, 'storage', `${type}.json`);

    try {
        const data = fs.existsSync(jsonPath)
            ? JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
            : [];

        data.push({ name, audio, image });

        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

        res.json({ success: true });
    } catch (error) {
        console.error("JSON update error:", error);
        res.status(500).json({ success: false, message: "Failed to update" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
