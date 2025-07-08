const pool = require("../connect");

// ✅ Create new user by name and phone (role is defaulted to 'buyer' in DB)
exports.createUser = async ({ name, phone }) => {
  const result = await pool.query(
    `INSERT INTO users (name, phone)
     VALUES ($1, $2)
     RETURNING id, name, phone, role, created_at`,
    [name, phone]
  );

  return result.rows[0];
};

// ✅ Find user by phone number
exports.findByPhone = async (phone) => {
  const result = await pool.query(
    `SELECT id, name, phone, role, created_at FROM users WHERE phone = $1`,
    [phone]
  );

  return result.rows[0];
};

// ✅ Find user by ID
exports.findById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, phone, role, created_at FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};
