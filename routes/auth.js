const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db"); // Ensure this points to your db.js file
const { verifyToken } = require("../middleware/auth"); // Correct path for JWT middleware

const router = express.Router();

// User login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const userResult = await pool.query(
      "SELECT * FROM Users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret", // Use environment variable for the secret
      { expiresIn: "1h" }
    );

    // Send the token and success message
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name, // Include the user's name here
        role: user.role,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// User registration route
router.post("/register", async (req, res) => {
  const { username, password, role, name, email, phone } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await pool.query(
      "SELECT * FROM Users WHERE username = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Check if the email already exists
    const existingEmail = await pool.query(
      "SELECT * FROM Users WHERE email = $1",
      [email]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const result = await pool.query(
      `INSERT INTO Users (username, password, role, name, email, phone)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, role`,
      [username, hashedPassword, role, name, email, phone]
    );

    const user = result.rows[0];

    // Generate a JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret", // Use environment variable for the secret
      { expiresIn: "1h" }
    );

    // Send back the token and user details
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name, // Pass the name from the request
        role: user.role,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard route to fetch enrollment data
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    // Replace this with your actual data fetching logic
    const labels = ["Computer Science", "Mathematics", "Physics", "Biology"];
    const enrollmentCounts = [120, 80, 60, 90]; // Replace with actual counts from your database

    res.json({ labels, enrollmentCounts });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Export the router
module.exports = router;
