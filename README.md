# 🏦 Web Application SQL Injection Demo

## Overview
This mini-project is a comprehensive demonstration of SQL Injection (SQLi) vulnerabilities within a typical web application authentication flow. It was built to illustrate how unsanitized user input can lead to unauthorized access, data exfiltration, and complete system compromise, followed by the implementation of a secure solution.

## 🎯 Project Objectives
1. **Demonstrate Vulnerability:** Show how concatenating strings in SQL queries creates critical security flaws.
2. **Execute Attacks:** Perform realistic attack scenarios including Auth Bypass, Time-Based Blind SQLi, and UNION-based injections.
3. **Implement Defense:** Fix the vulnerability using modern security practices (Parameterized Queries).

## 🛠️ Technologies Used
* **Backend:** Node.js, Express.js
* **Database:** SQLite3
* **Frontend:** HTML5, CSS3, Vanilla JavaScript

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   \`\`\`bash
   git clone <YOUR_GITHUB_REPO_URL>
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install express sqlite3
   \`\`\`
3. Initialize the mock database (Generates 50 random customers with realistic data):
   \`\`\`bash
   node setup_db.js
   \`\`\`
4. Start the server:
   \`\`\`bash
   node server.js
   \`\`\`
5. Open your browser and navigate to \`http://localhost:3000\`

## ⚔️ Attack Scenarios (Live Demo)

The application has a vulnerable login route (`/login-vulnerable`). 

### 1. Targeted Auth Bypass
Injecting SQL into the password field to bypass authentication for a specific user ID.
* **Payload (Password):** `' OR id_number='343345800`
* **Result:** Grants access to the target's account without knowing the password.

### 2. Heavy Computation (Time-Based) Attack
Proving vulnerability when errors are suppressed by forcing the database into a heavy computation loop.
* **Payload (Password):** `' OR (WITH RECURSIVE r(i) AS (VALUES(1) UNION ALL SELECT i+1 FROM r WHERE i < 5000000) SELECT count(*) FROM r) > 0 -- `
* **Result:** The server response is delayed by several seconds, proving code execution.

### 3. Data Forgery via UNION
Injecting forged records directly into the application's UI.
* **Payload (Password):** `' UNION SELECT '000', 'PENETRATION TEST', 'N/A', '999999.00', '4580-0000-0000-0000', '12/99', '000' -- `
* **Result:** The dashboard displays the attacker's fabricated data.

## 🛡️ The Solution: Parameterized Queries
The project includes a secure route (`/login-secure`) that demonstrates how to prevent SQL injection. By using **Parameterized Queries** (Prepared Statements), the database engine treats user input strictly as data, not as executable code, completely neutralizing the attacks.

---
*Developed for educational purposes and network security demonstration.*