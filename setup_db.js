// import libreries
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// init DB connection
const db = new sqlite3.Database('./bank_data.sqlite', (err) => {
    if (err) {
        console.error("[DB ERROR] Failed to create DB:", err.message);
    } else {
        console.log("[SYSTEM] DB connected successfully.");
    }
});

// Generating random customers
const firstNames = ["Asaf", "Benny", "Carmel", "Dana", "Eliko", "Fredy", "Gal", "Hodaya", "Iris", "July", "Kobi", "Leah", "Maya", "Naama", "Or", "Paz"];
const lastNames = ["Cohen", "Levi", "Levy", "Hadassi", "Bachar", "Zloof", "Ozery", "Ovadya", "Ovadia", "Weiss", "Yaakov", "Halevi", "Hasson", "Swartz", "Ozer", "Katz", "Avram", "Frydman", "Ohayon", "Caspi"];

// get a random number
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//  initialization function
async function initDB() {
    
    console.log("[SYSTEM] Generating customer data and hashing passwords");
    
    const customers = [];

    // first generate all mock data and await password hashes 
    for (let i = 0; i < 50; i++) {
        
        // Generate 9-digit ID
        const idNumber = String(getRandomInt(100000000, 999999999));
        
        // Generate Full Name
        const fullName = `${firstNames[getRandomInt(0, firstNames.length - 1)]} ${lastNames[getRandomInt(0, lastNames.length - 1)]}`;
        
        // Generate simple password
        const vulnPassword = "pass" + getRandomInt(1000, 9999);
        
        // Hashed password for the Secure route
        const hashedPassword = await bcrypt.hash(vulnPassword, 10);
        
        // Generate random balance between 1,000-150,000
        const balance = (Math.random() * (150000 - 1000) + 1000).toFixed(2);
        
        // Generate 16-digit credit card (prefix 4580 + 12 random digits)
        const ccNumber = `4580 ${String(getRandomInt(1000, 9999))} ${String(getRandomInt(1000, 9999))} ${String(getRandomInt(1000, 9999))}`;
        
        // Generate expiration (month 01-12, year 27-31)
        const ccExp = `${String(getRandomInt(1, 12)).padStart(2, '0')}/${String(getRandomInt(27, 31))}`;
        
        // Generate CVV
        const ccCVV = String(getRandomInt(100, 999));

        customers.push({
            id: idNumber,
            name: fullName,
            password: hashedPassword,
            password_vuln: vulnPassword,
            balance: balance,
            cc: ccNumber,
            exp: ccExp,
            cvv: ccCVV
        });
    }


    // building the synchronous table with random data
    db.serialize(() => {
        
        // Reset table
        db.run("DROP TABLE IF EXISTS customers");

        // Create the structured table
        // Schema includes both hashed and vulnerable plain-text passwords
        db.run(`CREATE TABLE customers (
            id_number TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            password TEXT NOT NULL,
            password_vuln TEXT NOT NULL,
            account_balance REAL,
            credit_card_number TEXT,
            credit_card_exp TEXT,
            credit_card_cvv TEXT
        )`);

        // insertion statement
        const insert = db.prepare("INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        customers.forEach(customer => {
            insert.run(customer.id, customer.name, customer.password, customer.password_vuln, customer.balance, customer.cc, customer.exp, customer.cvv);
        });

        insert.finalize();

        console.log("[SYSTEM] 50 random customers successfully inserted into the database!");
        
        db.close((err) => {
            if (err) console.error("[DB ERROR] Error closing DB:", err.message);
            else console.log("[SYSTEM] DB connection closed securely.");
        });
    });
}

// Execute the initialization
initDB();