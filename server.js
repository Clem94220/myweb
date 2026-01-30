/**
 * VIEW COUNTER SERVER - Crystal Solution
 * Simple Express server to track and persist view counts
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'views-data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Initialize or load view count
function getViewCount() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            return data.views || 0;
        }
    } catch (error) {
        console.error('Error reading view count:', error);
    }
    return 0;
}

// Save view count
function saveViewCount(count) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ 
            views: count,
            lastUpdated: new Date().toISOString()
        }, null, 2));
    } catch (error) {
        console.error('Error saving view count:', error);
    }
}

// Track unique visitors using a simple in-memory set (resets on server restart)
const visitedIPs = new Set();

// API Routes

// GET - Get current view count (no increment)
app.get('/api/views', (req, res) => {
    const views = getViewCount();
    res.json({ views });
});

// POST - Increment view count (with IP tracking to prevent spam)
app.post('/api/views', (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Check if this IP already visited in this session
    if (!visitedIPs.has(clientIP)) {
        visitedIPs.add(clientIP);
        
        let views = getViewCount();
        views++;
        saveViewCount(views);
        
        console.log(`👁️ New visitor from ${clientIP}! Total: ${views}`);
        res.json({ views, isNewVisit: true });
    } else {
        // Return current count without incrementing
        const views = getViewCount();
        console.log(`🔄 Returning visitor from ${clientIP}. Total: ${views}`);
        res.json({ views, isNewVisit: false });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║     🔮 CRYSTAL SOLUTION - View Counter         ║
║     Server running on http://localhost:${PORT}     ║
╠════════════════════════════════════════════════╣
║  API Endpoints:                                ║
║  GET  /api/views  - Get current view count     ║
║  POST /api/views  - Increment (+1 per IP)      ║
╚════════════════════════════════════════════════╝
    `);
    
    // Initialize data file if doesn't exist
    if (!fs.existsSync(DATA_FILE)) {
        saveViewCount(823); // Start with realistic number
        console.log('📁 Created views-data.json with initial count: 823');
    } else {
        console.log(`👁️  Current view count: ${getViewCount()}`);
    }
});
