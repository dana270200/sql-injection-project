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

    // We use db.get() to simulate typical login behavior (returning the first match)
    db.get(query, (err, row) => {
        const executionDuration = Date.now() - startTime;
        console.log(`[STASTISTICS] Query Execution Time: ${executionDuration}ms`);

        if (err) {
            console.error(`[DATABASE ERROR] Exception caught: ${err.message}`);
            // Return internal error screen with leaked debugging information
            return res.status(500).send(`
                <div style="text-align:center; margin-top:50px; font-family:sans-serif; background-color:#f4f7f6; padding:40px; border-radius:10px; max-width:600px; margin-left:auto; margin-right:auto; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                    <h2 style="color:#d91c24;">Application Exception</h2>
                    <p style="color:#555;">An unhandled database exception occurred during authentication.</p>
                    <div style="background:#fff; padding:15px; border-left:4px solid #d91c24; text-align:left; font-family:monospace; color:#333; margin-top:20px; overflow-x:auto;">
                        <strong>Detailed Exception Log:</strong><br>
                        ${err.message}
                    </div>
                    <br>
                    <a href="/" style="color:#d91c24; text-decoration:none; font-weight:bold;">Return to Login</a>
                </div>
            `);
        }

        if (row) {
            console.log(`[AUTH SUCCESS] Record Found: ${row.full_name}`);
            console.log(`[EXFILTRATION] Balance: ${row.account_balance} | CC: ${row.credit_card_number}`);

            try {
                let dashboardHtml = fs.readFileSync(path.join(__dirname, 'public', 'dashboard.html'), 'utf-8');
                
                // Formats numbers as currency. If Injection creates a non-numeric string (like UNION), returns raw string.
                const formattedBalance = typeof row.account_balance === 'number' 
                    ? row.account_balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                    : row.account_balance;

                // Injecting DB data into template placeholders
                dashboardHtml = dashboardHtml.replace('{{FULL_NAME}}', row.full_name)
                                             .replace(/{{BALANCE}}/g, formattedBalance)
                                             .replace('{{CC_NUMBER}}', row.credit_card_number)
                                             .replace('{{CC_EXP}}', row.credit_card_exp)
                                             .replace('{{CC_CVV}}', row.credit_card_cvv);

                res.send(dashboardHtml);
            } catch (fsErr) {
                console.error("[SERVER ERROR] Template not found.");
                res.status(500).send("Internal Server Error: Dashboard Template Missing.");
            }
        } else {
            console.log("[AUTH FAILURE] No matching records found for provided credentials.");
            res.redirect('/?error=1');
        }
        console.log("-".repeat(60));
    });
});

// 5. START SERVER
app.listen(PORT, () => {
    console.log("[SYSTEM] Server initialized and running at http://localhost:" + PORT);
});