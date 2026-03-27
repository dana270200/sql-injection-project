# 🏦 Web Application SQL Injection Demo (Bank Hapoalim Simulation)

🎓 **Academic Project**
Developed as part of the *Network Security* course
**Ben-Gurion University of the Negev**
Fall Semester 2025

---

## 📖 Overview

This project is an interactive demonstration of **SQL Injection** vulnerabilities, built as a realistic simulation of a banking login system.

It shows how unsafe handling of user input can lead to serious security issues such as:

* Unauthorized access
* Exposure of sensitive data
* Full database leaks

The system allows switching between a **vulnerable mode** and a **secure mode**, making it easy to see both how attacks work and how they can be prevented using modern security techniques.

---

## 🎯 Project Objectives

1. **Demonstrate Vulnerabilities**
   Show how unsafe string concatenation in SQL queries leads to critical exploits.

2. **Interactive Live Demo**
   Seamlessly switch between:

   * Vulnerable mode
   * Secure mode

3. **Simulate Real Attacks**

   * Authentication bypass
   * Blind SQL Injection (time-based)
   * UNION-based data manipulation & exfiltration

4. **Implement Strong Defenses**

   * Parameterized queries
   * Input validation (Regex)
   * Rate limiting
   * Password hashing (bcrypt)

---

## 🛠️ Technologies Used

* **Backend:** Node.js, Express.js
* **Database:** SQLite3
* **Security:** bcrypt, express-rate-limit
* **Frontend:** HTML5, CSS3 (Bank UI simulation), Vanilla JavaScript

---

## 🚀 Getting Started

### 1. Installation

```bash
git clone https://github.com/dana270200/sql-injection-project
cd sql-injection-project
npm install
```

---

### 2. Database Setup (Choose One)

#### ✅ Option A: Use Existing Database

A prebuilt database (`bank_data.sqlite`) is included.

**Test User (only valid with existing DB):**

* ID: `374787521`
* Password: `pass1174`
* Name: Iris Ozery

> ⚠️ If you regenerate the database, this user will no longer exist.

---

#### 🔄 Option B: Generate New Database

Creates 50 random users with fresh credentials:

```bash
rm bank_data.sqlite
node setup_db.js
node peek.js
```

Use the credentials printed by `peek.js`.

---

### 3. Run the Server

```bash
node server.js
```

Open:

```
http://localhost:3000
```

---

## 🎭 Switching Between Modes

The system includes **hidden UI triggers** for a seamless demo:

* **Vulnerable Mode:** Click on *Irena* (background character)
* **Secure Mode:** Click on *Hila Korach* (red jacket)

A toast notification confirms the current mode.

---

## 🧰 Built-in Demo Tools

* **Support Mode:**
  A helper panel containing ready-to-use SQL injection payloads for quick demonstrations.

* **peek.js:**
  Displays valid login credentials directly from the database.

* **Persistent Mode State:**
  The selected mode (secure/vulnerable) is preserved via URL parameters when logging out.

* **Terminal Logs:**
  All actions are logged in real time:

  * Login attempts
  * SQL queries
  * Execution times
  * Money transfers

---

## ⚔️ Attack Scenarios (Vulnerable Mode Only)

All attacks are performed by injecting input into the **ID** or **Password** fields in the login form.

* **🔓 Authentication Bypass (ID field)**
  Injecting a comment (`--`) allows login without validating the password.

* **🔓 Tautology Bypass (Password field)**
  Using a condition like `' OR '1'='1` forces the query to always return TRUE, granting access.

* **⏱️ Time-Based Blind SQL Injection (Password field)**
  A heavy SQL operation is injected to delay the response, proving code execution even without visible output.

* **🧪 UNION-Based Injection (Password field)**
  Injects custom data into the query results, allowing fake or manipulated user data to appear in the dashboard.

* **📤 Data Exfiltration (Password field)**
  Extracts sensitive information (e.g., names, IDs, credit cards) from the entire database into a single response.

* **🚫 Validation Bypass**
  Client-side restrictions can be bypassed, allowing direct interaction with backend logic.

---

## 💸 Post-Login Simulation

After a successful login or attack:

* View sensitive user data
* Perform **simulated money transfers**
* Observe balance changes in real time

> ⚠️ Transfers are simulated (client-side) and do not persist in the database.

---

## 🛡️ Defense in Depth (Secure Mode)

The `/login-secure` route implements layered security:

* **Parameterized Queries**
  Prevent SQL injection by separating code from data

* **Password Hashing (bcrypt)**
  Secure storage of credentials

* **Input Validation (Regex)**
  Ensures ID format (exactly 9 digits)

* **Rate Limiting**
  Blocks IP after multiple failed attempts (Brute Force protection)

---

## ⚠️ Limitations

* Uses **SQLite** (not production-scale)
* Some dashboard actions are **client-side simulations**
* Database is **reset on regeneration**

---

## 📜 Disclaimer

This project was developed strictly for **educational purposes** to demonstrate the dangers of insecure coding practices in financial systems.

All data is randomly generated and does not represent real individuals.

---

## 👩‍💻 Author

**Dana Hadassi**
