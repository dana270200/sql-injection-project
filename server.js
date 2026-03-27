// Bring in dependencies
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

// Create the app instance
const app = express();

// App settings
const PORT = 3000;
const DB_PATH = './bank_data.sqlite';

// Make sure the DB file actually exists before connecting
if (!fs.existsSync(DB_PATH)) {
    console.error(`\n[FATAL ERROR] DB file not found at: ${DB_PATH}`);
    console.error("[INSTRUCTION] Please run 'node setup_db.js' first to generate the DB.\n");
    process.exit(1); 
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// When hitting '/', just send the login page
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

// Limit how many login attempts someone can make (basic brute-force protection)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,                  
    message: "Too many login attempts. Account temporarily locked.",
    handler: (req, res, next, options) => {
        console.log(`[SECURITY BLOCK] Too many requests from IP ${req.ip}`);
        res.status(options.statusCode).send(`
            <script>
                alert('SECURITY ALERT: Maximum login attempts exceeded.');
                window.location.href = '/?error=1';
            </script>
        `);
    }
});

// Open connection to DB
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error("[DB ERROR]", err.message);
});

// Small helper to build the dashboard with user data
function buildDashboard(row) {
    let html = fs.readFileSync(path.join(__dirname, 'public', 'dashboard.html'), 'utf-8');
    const balance = typeof row.account_balance === 'number'
        ? row.account_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : row.account_balance;
        
    // If we hack the system with a long payload
    const cardName = row.full_name.length > 25 ? 'SYSTEM HACKED' : row.full_name.toUpperCase();

    return html
        .replace('{{FULL_NAME}}', row.full_name)      
        .replace('{{FULL_NAME}}', cardName)           
        .replace(/{{BALANCE}}/g, balance)
        .replace('{{CC_NUMBER}}', row.credit_card_number)
        .replace('{{CC_EXP}}', row.credit_card_exp)
        .replace('{{CC_CVV}}', row.credit_card_cvv);
}

// ==========================================
// VULNERABLE ROUTE 
// ==========================================
app.post('/login-vulnerable', (req, res) => {
    const { id_number, password } = req.body;
    const start = Date.now();

    // VULNERABLE SQL: String concatenation targeting the plain-text password column (password_vuln in DB)
    const query = `SELECT * FROM customers WHERE id_number = '${id_number}' AND password_vuln = '${password}'`;
    
    db.get(query, (err, row) => {
        const ms = Date.now() - start;
        if (err || !row) {
            console.log(`[VULNERABLE] FAIL    | ${ms}ms | ${query}`);
            // Added mode=vulnerable to the redirect URL
            return res.redirect(`/?error=1&last_id=${encodeURIComponent(id_number)}&mode=vulnerable`);       
        }
        console.log(`[VULNERABLE] SUCCESS | ${ms}ms | ${query}`);
        res.send(buildDashboard(row));
    });
});

// ==========================================
// SECURE ROUTE
// ==========================================
app.post('/login-secure', loginLimiter, (req, res) => {
    const { id_number, password } = req.body;
    const start = Date.now();

    // --- SECURITY LAYER 2: Input Validation ---
    // Make sure ID is a valid 9-digit number
    const idRegex = /^\d{9}$/;
    if (!idRegex.test(id_number)) {
        console.log(`[SECURE]     FAIL    | 0ms | Invalid ID Format.`);
        // Added mode=secure to the redirect URL
        return res.redirect(`/?error=1&last_id=${encodeURIComponent(id_number)}&mode=secure`);
    }

    // --- SECURITY LAYER 3: Parameterized Query ---
    // Only fetch by ID (don’t mix password into the query)
    const query = `SELECT * FROM customers WHERE id_number = ?`;

    db.get(query, [id_number], async (err, row) => {
        const ms = Date.now() - start;
        if (err || !row) {
            console.log(`[SECURE]     FAIL    | ${ms}ms | User not found `);
            return res.redirect(`/?error=1&last_id=${encodeURIComponent(id_number)}`);
        }

        // --- SECURITY LAYER 4: Password Check ---
        // Compare hashed password using bcrypt
        const match = await bcrypt.compare(password, row.password);
        
        if (!match) {
            console.log(`[SECURE]    FAIL    | ${ms}ms | Wrong password for ${row.id_number} (${row.full_name})`);
            return res.redirect(`/?error=1&last_id=${encodeURIComponent(id_number)}`);
        }

        console.log(`[SECURE]    SUCCESS | ${query} | ${ms}ms`);
        res.send(buildDashboard(row));
    });
});

// Fake transfer endpoint (not real action)
app.post('/transfer', (req, res) => {
    const { from_name, amount, target_account, current_balance } = req.body;
    const newBalance = (parseFloat(current_balance) - parseFloat(amount)).toFixed(2);
    console.log(`[TRANSFER] ${from_name} sent ₪${amount}  to ${target_account}`);    
    res.json({ success: true, newBalance });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
});

// ==========================================
// GRACEFUL SHUTDOWN (Ctrl+C handling)
// ==========================================
// When stopping the app, close the DB connection properly
process.on('SIGINT', () => {
    
    db.close((err) => {        
        server.close(() => {
            if (err) {
                console.error("[SERVER] Server stopped with error closing DB:", err.message);
            } else {
                console.log("[SERVER] Server stopped cleanly.");
            }
            process.exit(0);
        });
    });
});