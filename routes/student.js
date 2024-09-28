const express = require("express");
const pool = require("../db"); // Ensure this points to your db.js file
const authMiddleware = require("../middleware/auth"); // Import the middleware

const router = express.Router();

// Get student profile
router.get("/profile", authMiddleware, async (req, res) => {
  const userId = req.user.id; // Get user ID from the token
  try {
    const result = await pool.query(
      "SELECT * FROM StudentProfile WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search for other students
router.get("/search", authMiddleware, async (req, res) => {
  const { name, department_id, year } = req.query; // Get query parameters
  try {
    const query = `
            SELECT * FROM StudentProfile
            WHERE name ILIKE $1 AND 
            (department_id = $2 OR $2 IS NULL) AND 
            (year = $3 OR $3 IS NULL)
        `;
    const result = await pool.query(query, [`%${name}%`, department_id, year]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
