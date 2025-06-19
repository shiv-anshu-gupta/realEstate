const pool = require("../connect");
const bcrypt = require("bcrypt");

// Create new user
exports.createUser = async ({ name, email, password, phone, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, phone, created_at`,
    [name, email, hashedPassword, phone, role]
  );

  return result.rows[0];
};

// Find user by email
exports.findByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  return result.rows[0];
};

// Find user by ID
exports.findById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};
