// 1. IMPORT LIBRARIES
const sqlite3 = require('sqlite3').verbose();

// 2. INITIALIZE DATABASE CONNECTION
const db = new sqlite3.Database('./bank_data.sqlite', (err) => {
    if (err) {
        console.error("Error creating database:", err.message);
    } else {
        console.log("Database connected. Generating random users...");
    }
});

// 3. HELPER ARRAYS FOR RANDOM GENERATION
const firstNames = ["Asaf", "Benny", "Cris", "Dana", "Eliko", "Fredy", "Gal", "Hodaya", "Iris", "July", "Kobi", "Leah", "Maya", "Naama", "Or", "Paz", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Cohen", "Levi", "Levy", "Hadassi", "Bachar", "Zloof", "Ozery", "Ovadya", "Ovadia", "Weiss", "Yaakov", "Halevi", "Hasson", "Swartz", "Ozer", "Katz", "Avram", "Frydman", "Ohayon", "Caspi"];

// Helper function to get a random number in a range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 4. BUILD THE TABLE AND INJECT RANDOM DATA
db.serialize(() => {
    
    // Reset table for a fresh start
    db.run("DROP TABLE IF EXISTS customers");

    // Create the structured table
    db.run(`CREATE TABLE customers (
        id_number TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        password TEXT NOT NULL,
        account_balance REAL,
        credit_card_number TEXT,
        credit_card_exp TEXT,
        credit_card_cvv TEXT
    )`);

    // Prepare the insertion statement
    const stmt = db.prepare("INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?)");

    // Loop to create 50 entirely random users
    for (let i = 0; i < 50; i++) {
        // Generate 9-digit ID
        const idNumber = String(getRandomInt(100000000, 999999999));
        
        // Generate Full Name
        const fullName = `${firstNames[getRandomInt(0, firstNames.length - 1)]} ${lastNames[getRandomInt(0, lastNames.length - 1)]}`;
        
        // Generate simple password
        const password = "pass" + getRandomInt(1000, 9999);
        
        // Generate random balance between 1,000 and 150,000
        const balance = (Math.random() * (150000 - 1000) + 1000).toFixed(2);
        
        // Generate Realistic 16-digit Credit Card (Prefix 4580 + 12 random digits)
        const ccNumber = `4580 ${String(getRandomInt(1000, 9999))} ${String(getRandomInt(1000, 9999))} ${String(getRandomInt(1000, 9999))}`;
        
        // Generate Expiration (Month 01-12, Year 26-31)
        const expMonth = String(getRandomInt(1, 12)).padStart(2, '0');
        const expYear = String(getRandomInt(27, 31));
        const ccExp = `${expMonth}/${expYear}`;
        
        // Generate CVV
        const ccCvv = String(getRandomInt(100, 999));

        // Execute insertion
        stmt.run(idNumber, fullName, password, balance, ccNumber, ccExp, ccCvv);
    }

    stmt.finalize();
    console.log("SUCCESS: 50 random customers successfully generated and injected into bank_data.sqlite!");
});

// 5. CLOSE CONNECTION
db.close();