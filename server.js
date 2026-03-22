const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./bank_data.sqlite', (err) => {
    if (err) console.error("[DB ERROR]", err.message);
    else console.log("[SERVER] Running on http://localhost:" + PORT);
});

function buildDashboard(row) {
    let html = fs.readFileSync(path.join(__dirname, 'public', 'dashboard.html'), 'utf-8');
    const balance = typeof row.account_balance === 'number'
        ? row.account_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : row.account_balance;
    return html
        .replace('{{FULL_NAME}}', row.full_name)
        .replace(/{{BALANCE}}/g, balance)
        .replace('{{CC_NUMBER}}', row.credit_card_number)
        .replace('{{CC_EXP}}', row.credit_card_exp)
        .replace('{{CC_CVV}}', row.credit_card_cvv);
}

// VULNERABLE ROUTE
app.post('/login-vulnerable', (req, res) => {
    const { id_number, password } = req.body;
    const query = `SELECT * FROM customers WHERE id_number = '${id_number}' AND password = '${password}'`;
    const start = Date.now();

    db.get(query, (err, row) => {
        const ms = Date.now() - start;
        if (err) {
            console.log(`[VULNERABLE] ERROR   | ${ms}ms | ${query}`);
            return res.redirect(`/?error=1&last_id=${encodeURIComponent(id_number)}`);
        }
        if (!row) {
            console.log(`[VULNERABLE] FAIL    | ${ms}ms | ${query}`);
            return res.redirect(`/?error=1&last_id=${encodeURIComponent(id_number)}`);
        }
        console.log(`[VULNERABLE] SUCCESS | ${ms}ms | ${query}`);
        console.log(`             USER    | ${row.full_name} | Balance: ₪${row.account_balance}`);
        res.send(buildDashboard(row));
    });
});

// SECURE ROUTE
app.post('/login-secure', (req, res) => {
    const { id_number, password } = req.body;
    const query = `SELECT * FROM customers WHERE id_number = ? AND password = ?`;
    const start = Date.now();

    db.get(query, [id_number, password], (err, row) => {
        const ms = Date.now() - start;
        if (err || !row) {
            console.log(`[SECURE]    FAIL    | ${ms}ms | params: ['${id_number}', '${password}']`);
            return res.redirect(`/?error=1&last_id=${encodeURIComponent(id_number)}`);
        }
        console.log(`[SECURE]    SUCCESS | ${ms}ms | params: ['${id_number}', '${password}']`);
        console.log(`            USER    | ${row.full_name} | Balance: ₪${row.account_balance}`);
        res.send(buildDashboard(row));
    });
});

// FAKE TRANSFER — logs to terminal, returns new balance
app.post('/transfer', (req, res) => {
    const { from_name, amount, target_account, current_balance } = req.body;
    const newBalance = (parseFloat(current_balance) - parseFloat(amount)).toFixed(2);

    console.log(`[TRANSFER]  EXECUTED | ₪${amount} FROM: ${from_name} → ACCOUNT: ${target_account}`);
    console.log(`            BALANCE  | ₪${current_balance} → ₪${newBalance}`);

    res.json({ success: true, newBalance });
});

// FAKE UPDATE DETAILS — logs to terminal
app.post('/update-details', (req, res) => {
    const { full_name, new_email, new_phone } = req.body;

    console.log(`[UPDATE]    DETAILS  | USER: ${full_name}`);
    console.log(`            EMAIL    | → ${new_email}`);
    console.log(`            PHONE    | → ${new_phone}`);

    res.json({ success: true });
});

app.listen(PORT);