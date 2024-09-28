const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const facultyRoutes = require("./routes/faculty");
const adminRoutes = require("./routes/admin");

// Set up Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/api/user", userRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "mannem_07",
  port: 5432,
});
//using routes
app.use("/api/auth", authRoutes);

// Example route to test connection
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
