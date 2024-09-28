const { Pool } = require("pg");

// Set up the connection pool
const pool = new Pool({
  user: "postgres", // Your PostgreSQL username
  host: "localhost", // Host where your PostgreSQL server is running
  database: "college_directory", // Your database name
  password: "mannem_07", // Your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

// Export the pool
module.exports = pool;
