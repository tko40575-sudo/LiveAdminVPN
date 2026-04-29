const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DB_FILE = 'db.json';

// Initialize Database if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }));
}

// Database Helper Functions
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// 💾 CRUD APIs for Users (Save & Delete)
app.get('/api/users', (req, res) => {
    res.json(readDB().users);
});

app.post('/api/users', (req, res) => {
    const db = readDB();
    const newUser = { id: Date.now().toString(), ...req.body };
    db.users.push(newUser);
    writeDB(db);
    res.json({ success: true, user: newUser });
});

app.delete('/api/users/:id', (req, res) => {
    const db = readDB();
    db.users = db.users.filter(u => u.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
});

// 🔄 Live VPN Checker API
app.post('/api/live-check', (req, res) => {
    const { type, url, username, password, clientId } = req.body;

    if (type === 'outline') {
        exec(`go run outline_api.go "${url}" "${clientId}"`, (error, stdout) => {
            try { res.json(JSON.parse(stdout)); } 
            catch (e) { res.json({ error: "Outline Fetch Error" }); }
        });
    } 
    else if (type === 'vless') {
        exec(`python vless_api.py "${url}" "${username}" "${password}" "${clientId}"`, (error, stdout) => {
            try { res.json(JSON.parse(stdout)); } 
            catch (e) { res.json({ error: "VLESS Fetch Error" }); }
        });
    } else {
        res.json({ error: "Invalid VPN Type" });
    }
});

app.listen(3000, () => {
    console.log('🚀 Dashboard Server running on http://localhost:3000');
});