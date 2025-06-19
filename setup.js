const pool = require("./connect.js");

async function createTables() {
  try {
    // Drop tables if they already exist (in correct order to respect FK constraints)
    await pool.query(`DROP TABLE IF EXISTS properties;`);
    await pool.query(`DROP TABLE IF EXISTS users;`);

    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        role TEXT DEFAULT 'buyer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create properties table
    await pool.query(`
      CREATE TABLE properties (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'available',
        type TEXT CHECK (type IN ('rent', 'sale')) NOT NULL,
        sub_type TEXT,
        rooms INTEGER,
        area TEXT,
        price INTEGER NOT NULL,

        images TEXT[],
        video TEXT,
        floor_plan TEXT,

        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        latitude TEXT,
        longitude TEXT,

        age TEXT,
        bedrooms INTEGER,
        bathrooms INTEGER,

        features TEXT[],

        name TEXT,
        username TEXT,
        email TEXT,
        phone TEXT,

        nearby JSONB,  -- ✅ Optional field to store nearby places (education, health, etc.)

        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tables created and updated successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    pool.end(); // close DB connection
  }
}

createTables();
