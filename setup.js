const pool = require("./connect.js");

async function createTables() {
  try {
    // Drop tables in order to avoid foreign key conflicts
    await pool.query(`DROP TABLE IF EXISTS tours;`);
    await pool.query(`DROP TABLE IF EXISTS properties;`);
    await pool.query(`DROP TABLE IF EXISTS users;`);

    // Users Table
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

    // Properties Table
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

        nearby JSONB,

        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ✅ Tours Table
    await pool.query(`
      CREATE TABLE tours (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        tour_date DATE NOT NULL,
        tour_time TIME NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tables created and updated successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    pool.end(); // Close DB connection
  }
}

createTables();
