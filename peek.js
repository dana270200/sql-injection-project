const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./bank_data.sqlite');

console.log("--- Customer Database Roster ---");
// This will fetch ALL users and print their ID and Name
db.all("SELECT id_number,password, full_name, account_balance FROM customers", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    rows.forEach((row, index) => {
        console.log(`[${index + 1}] ID: ${row.id_number} | Password: ${row.password} | Name: ${row.full_name} | Balance: ₪${row.account_balance}`);
    });
});

db.close();