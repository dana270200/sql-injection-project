// 1. IMPORTING LIBRARIES
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 2. CONFIGURATION
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 3. DATABASE CONNECTION
const db = new sqlite3.Database('./bank_data.sqlite', (err) => {
    if (err) {
        console.error("[DATABASE ERROR] Failed to connect:", err.message);
    } else {
        console.log("[SYSTEM] Database connection established. Listening on Port:", PORT);
    }
});

// 4. THE LOGIN ROUTE (Vulnerable Version)
app.post('/login-vulnerable', (req, res) => {
    const { id_number, password } = req.body;

    // --- SQL INJECTION VULNERABILITY ---
    const query = `SELECT * FROM customers WHERE id_number = '${id_number}' AND password = '${password}'`;

    console.log("\n" + "-".repeat(60));
    console.log("[INCOMING REQUEST] Auth Attempt at /login-vulnerable");
    console.log(`[PAYLOAD] ID: ${id_number} | PASSWORD: ${password}`);
    console.log(`[SQL EXECUTION] ${query}`);

    const startTime = Date.now();

    db.get(query, (err, row) => {
        const executionDuration = Date.now() - startTime;
        console.log(`[STATISTICS] Query Execution Time: ${executionDuration}ms`);

        // If there's a SQL error OR no user is found
        if (err || !row) {
            if (err) {
                console.error(`[DATABASE ERROR] Exception caught: ${err.message}`);
            } else {
                console.log("[AUTH FAILURE] No matching records found.");
            }
            
            // Redirecting back to login. 
            // We append 'error=1' for the UI message and 'last_id' to keep the input sticky.
            return res.redirect(`/?error=1&last_id=${encodeURIComponent(id_number)}`);
        }

        // --- AUTH SUCCESS ---
        console.log(`[AUTH SUCCESS] Record Found: ${row.full_name}`);
        console.log(`[EXFILTRATION] Balance: ${row.account_balance} | CC: ${row.credit_card_number}`);

        try {
            let dashboardHtml = fs.readFileSync(path.join(__dirname, 'public', 'dashboard.html'), 'utf-8');
            
            const formattedBalance = typeof row.account_balance === 'number' 
                ? row.account_balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                : row.account_balance;

            dashboardHtml = dashboardHtml.replace('{{FULL_NAME}}', row.full_name)
                                         .replace(/{{BALANCE}}/g, formattedBalance)
                                         .replace('{{CC_NUMBER}}', row.credit_card_number)
                                         .replace('{{CC_EXP}}', row.credit_card_exp)
                                         .replace('{{CC_CVV}}', row.credit_card_cvv);

            res.send(dashboardHtml);
        } catch (fsErr) {
            console.error("[SERVER ERROR] Template not found.");
            res.status(500).send("Internal Server Error.");
        }
        console.log("-".repeat(60));
    });
});


// =========================================================================
// THE SOLUTION: SECURE LOGIN ROUTE (Using Parameterized Queries)
// =========================================================================
app.post('/login-secure', (req, res) => {
    const { id_number, password } = req.body;

    const query = `SELECT * FROM customers WHERE id_number = ? AND password = ?`;

    console.log("\n" + "=".repeat(60));
    console.log("🛡️ [SECURE ROUTE] Auth Attempt at /login-secure");
    console.log(`[PAYLOAD] ID: ${id_number} | PWD: ${password}`);
    console.log(`[SQL EXECUTION] ${query} (with parameters: [${id_number}, ${password}])`);

    const startTime = Date.now();

    db.get(query, [id_number, password], (err, row) => {
        const executionDuration = Date.now() - startTime;
        console.log(`[STATISTICS] Query Execution Time: ${executionDuration}ms`);

        if (err || !row) {
            if (err) console.error(`[DATABASE ERROR] ${err.message}`);
            
            // Secure rejection: Always redirect with generic error and keep ID sticky
            return res.redirect(`/?error=1&last_id=${encodeURIComponent(id_number)}`);
        }

        console.log(`[AUTH SUCCESS] Record Found: ${row.full_name}`);

        try {
            let dashboardHtml = fs.readFileSync(path.join(__dirname, 'public', 'dashboard.html'), 'utf-8');
            
            const formattedBalance = typeof row.account_balance === 'number' 
                ? row.account_balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                : row.account_balance;

            dashboardHtml = dashboardHtml.replace('{{FULL_NAME}}', row.full_name)
                                         .replace(/{{BALANCE}}/g, formattedBalance)
                                         .replace('{{CC_NUMBER}}', row.credit_card_number)
                                         .replace('{{CC_EXP}}', row.credit_card_exp)
                                         .replace('{{CC_CVV}}', row.credit_card_cvv);

            res.send(dashboardHtml);
        } catch (fsErr) {
            res.status(500).send("Internal Server Error.");
        }
        console.log("=".repeat(60));
    });
});


// 5. START SERVER
app.listen(PORT, () => {
    console.log("[SYSTEM] Server initialized and running at http://localhost:" + PORT);
});