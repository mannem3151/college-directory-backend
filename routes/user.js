const express = require("express");
const pool = require("../db"); // Ensure this points to your db.js file
const { verifyToken } = require("../middleware/auth"); // Import the middleware

const router = express.Router();

// Get user profile route
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the token

    // Fetch user profile from the database
    const result = await pool.query("SELECT * FROM Users WHERE id = $1", [
      userId,
    ]);

    // Check if the user exists
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with user profile data
    res.json({
      id: result.rows[0].id,
      username: result.rows[0].username,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      role: result.rows[0].role, // Include role if needed
    });
  } catch (error) {
    console.error("Error fetching user profile:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Update user profile route (optional)
router.put("/profile", verifyToken, async (req, res) => {
  const { name, email, phone } = req.body; // Get data from request body
  const userId = req.user.id; // Get user ID from the token

  try {
    // Update user profile in the database
    const result = await pool.query(
      "UPDATE Users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *",
      [name, email, phone, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with updated user profile data
    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user profile:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Export the router
module.exports = router;
