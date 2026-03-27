// Load sqlite + fs (for file checks)
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Path to DB file
const DB_PATH = './bank_data.sqlite';

// Make sure the DB file actually exists before connecting
if (!fs.existsSync(DB_PATH)) {
    console.error(`\n[FATAL ERROR] DB file not found at: ${DB_PATH}`);
    console.error("[INSTRUCTION] Please run 'node setup_db.js' first to generate the DB.\n");
    process.exit(1); 
}

// Connect to the local DB file
const db = new sqlite3.Database('./bank_data.sqlite');

console.log('--- Customer Database Roster ---');

// Fetch all customers and print some basic details
db.all(
    "SELECT id_number, password_vuln, full_name FROM customers",
    (err, rows) => {
        if (err) {
            // Something went wrong with the query
            console.error('[DB ERROR]', err.message);
            return;
        }

        // If no users found
        if (!rows || rows.length === 0) {
            console.log('No customers found in the database.');
            return;
        }

        // Loop through results and print them 
        rows.forEach((row, index) => {
            console.log(
                `[${index + 1}] ID: ${row.id_number} | Password: ${row.password_vuln} | Name: ${row.full_name}`
            );
        });
    }
);

// Close the database connection when done
db.close(() => {
    console.log('\n[DB] Connection closed.');
});