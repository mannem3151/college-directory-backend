const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db"); // Ensure this points to your db.js file
const { verifyToken } = require("../middleware/auth"); // Import the middleware

const router = express.Router();

// Create a new student record
router.post("/students", verifyToken, async (req, res) => {
  const { username, password, role, name, email, phone, department_id } =
    req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Users table
    const result = await pool.query(
      `INSERT INTO Users (username, password, role, name, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [username, hashedPassword, role, name, email, phone]
    );

    const userId = result.rows[0].id;
    console.log(userId);
    // Insert into StudentProfile table
    await pool.query(
      `INSERT INTO StudentProfile (user_id, department_id)
       VALUES ($1, $2)`,
      [userId, department_id]
    );

    res.status(201).json({ message: "Student created successfully" });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all students
router.get("/students", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.email, u.phone, s.department_id
       FROM Users u
       JOIN StudentProfile s ON u.id = s.user_id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update a student record
router.put("/students/:id", verifyToken, async (req, res) => {
  const studentId = req.params.id;
  const { username, name, email, phone, department_id } = req.body;

  try {
    // Update the Users table
    await pool.query(
      `UPDATE Users
       SET username = $1, name = $2, email = $3, phone = $4
       WHERE id = (SELECT user_id FROM StudentProfile WHERE id = $5)`,
      [username, name, email, phone, studentId]
    );

    // Update the StudentProfile table
    await pool.query(
      `UPDATE StudentProfile
       SET department_id = $1
       WHERE user_id = $2`,
      [department_id, studentId]
    );

    res.json({ message: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a student record
router.delete("/students/:id", verifyToken, async (req, res) => {
  const studentId = req.params.id;

  try {
    // Delete from StudentProfile first
    await pool.query("DELETE FROM StudentProfile WHERE user_id = $1", [
      studentId,
    ]);

    // Then delete from Users
    await pool.query("DELETE FROM Users WHERE id = $1", [studentId]);

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard metrics (student count, faculty count)
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const studentCountResult = await pool.query(
      "SELECT COUNT(*) FROM StudentProfile"
    );
    const facultyCountResult = await pool.query(
      "SELECT COUNT(*) FROM FacultyProfile"
    );

    res.json({
      studentCount: studentCountResult.rows[0].count,
      facultyCount: facultyCountResult.rows[0].count,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Add a new faculty member
router.post("/faculty", verifyToken, async (req, res) => {
  const { username, password, name, email, phone, department_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const result = await pool.query(
      "INSERT INTO Users (username, password, name, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [username, hashedPassword, name, email, phone]
    );
    const userId = result.rows[0].id;

    // Insert into FacultyProfile
    await pool.query(
      "INSERT INTO FacultyProfile (user_id, department_id) VALUES ($1, $2)",
      [userId, department_id]
    );

    res.status(201).json({ message: "Faculty member added successfully" });
  } catch (error) {
    console.error("Error adding faculty:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all faculty members
router.get("/faculty", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.email, u.phone, f.department_id
       FROM Users u
       JOIN FacultyProfile f ON u.id = f.user_id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching faculty:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update a faculty member
router.put("/faculty/:id", verifyToken, async (req, res) => {
  const facultyId = req.params.id;
  const { username, name, email, phone, department_id } = req.body;

  try {
    await pool.query(
      `UPDATE Users
       SET username = $1, name = $2, email = $3, phone = $4
       WHERE id = (SELECT user_id FROM FacultyProfile WHERE id = $5)`,
      [username, name, email, phone, facultyId]
    );

    await pool.query(
      `UPDATE FacultyProfile
       SET department_id = $1
       WHERE user_id = $2`,
      [department_id, facultyId]
    );

    res.json({ message: "Faculty updated successfully" });
  } catch (error) {
    console.error("Error updating faculty:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a faculty member
router.delete("/faculty/:id", verifyToken, async (req, res) => {
  const facultyId = req.params.id;

  try {
    await pool.query("DELETE FROM FacultyProfile WHERE user_id = $1", [
      facultyId,
    ]);

    await pool.query("DELETE FROM Users WHERE id = $1", [facultyId]);

    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    console.error("Error deleting faculty:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Add a new subject
router.post("/subjects", verifyToken, async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO Subjects (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error adding subject:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all subjects
router.get("/subjects", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Subjects");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching subjects:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update a subject
router.put("/subjects/:id", verifyToken, async (req, res) => {
  const subjectId = req.params.id;
  const { name, description } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Subjects
       SET name = $1, description = $2
       WHERE id = $3 RETURNING *`,
      [name, description, subjectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({
      message: "Subject updated successfully",
      subject: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating subject:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a subject
router.delete("/subjects/:id", verifyToken, async (req, res) => {
  const subjectId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM Subjects WHERE id = $1 RETURNING *",
      [subjectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Search for students and faculty
router.get("/search", verifyToken, async (req, res) => {
  const { query } = req.query; // Get the search query from the request
  try {
    const studentResult = await pool.query(
      "SELECT * FROM StudentProfile WHERE name ILIKE $1",
      [`%${query}%`]
    );
    const facultyResult = await pool.query(
      "SELECT * FROM FacultyProfile WHERE name ILIKE $1",
      [`%${query}%`]
    );

    res.json({
      students: studentResult.rows,
      faculty: facultyResult.rows,
    });
  } catch (error) {
    console.error("Error searching:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Export the router
module.exports = router;
