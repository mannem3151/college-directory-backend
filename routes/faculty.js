const express = require("express");
const pool = require("../db"); // Ensure this points to your db.js file
const { verifyToken } = require("../middleware/auth"); // Correct path to middleware

const router = express.Router();

// Get class list for a faculty member
router.get("/class-list", verifyToken, async (req, res) => {
  const facultyId = req.user.id; // Get the faculty ID from the token
  try {
    const result = await pool.query(
      `
            SELECT s.id, s.name, s.email, s.phone, c.name AS course_name 
            FROM StudentProfile s
            JOIN Enrollment e ON s.user_id = e.student_id
            JOIN Course c ON e.course_id = c.id
            WHERE c.faculty_id = $1
            `,
      [facultyId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this faculty member." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching class list:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Export the router
module.exports = router;
