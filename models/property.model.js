const pool = require("../connect");

// Insert property
exports.insertProperty = async (propertyData) => {
  try {
    const {
      title,
      description,
      status,
      type,
      sub_type,
      rooms,
      area,
      price,
      images,
      video,
      floor_plan,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      age,
      bedrooms,
      bathrooms,
      features,
      name,
      username,
      email,
      phone,
      user_id,
      nearby, // ✅ optional new field
    } = propertyData;

    console.log("📦 Inserting property data:", propertyData);

    const result = await pool.query(
      `INSERT INTO properties (
        title, description, status, type, sub_type, rooms, area, price,
        images, video, floor_plan, address, city, state, country, latitude, longitude,
        age, bedrooms, bathrooms, features,
        name, username, email, phone, user_id, nearby
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23, $24, $25, $26, $27
      ) RETURNING *;`,
      [
        title,
        description,
        status,
        type,
        sub_type,
        rooms,
        area,
        price,
        images,
        video,
        floor_plan,
        address,
        city,
        state,
        country,
        latitude,
        longitude,
        age,
        bedrooms,
        bathrooms,
        features,
        name,
        username,
        email,
        phone,
        user_id,
        nearby || null,
      ]
    );

    return result.rows[0];
  } catch (err) {
    console.error("❌ DB Insert Error:", err);
    throw err;
  }
};

// Get all properties
exports.getAllProperties = async () => {
  const result = await pool.query(`
    SELECT 
      id, title, description, status, type, sub_type, rooms, area, price,
      images, video, floor_plan, address, city, state, country, latitude, longitude,
      age, bedrooms, bathrooms, features,
      name, username, email, phone,
      user_id, listed_at, nearby
    FROM properties
    ORDER BY listed_at DESC;
  `);
  return result.rows;
};

// ✅ Get latest 3 properties
exports.getRecentProperties = async () => {
  const result = await pool.query(`
    SELECT 
      id, title, city, state, price, images, listed_at
    FROM properties
    ORDER BY listed_at DESC
    LIMIT 3;
  `);
  return result.rows;
};

// Build search query
const buildSearchQuery = (filters) => {
  let where = [];
  let values = [];

  if (filters.keyword) {
    values.push(`%${filters.keyword}%`);
    const idx = values.length;
    where.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
  }

  if (filters.type) {
    values.push(filters.type.toLowerCase());
    where.push(`type = $${values.length}`);
  }

  if (filters.sub_type) {
    values.push(filters.sub_type.toLowerCase());
    where.push(`sub_type = $${values.length}`);
  }

  if (filters.location) {
    values.push(`%${filters.location}%`);
    const idx = values.length;
    where.push(
      `(city ILIKE $${idx} OR state ILIKE $${idx} OR country ILIKE $${idx})`
    );
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  return { whereClause, values };
};

// Search properties
exports.searchProperties = async (filters, skip = 0, limit = 9) => {
  const { whereClause, values } = buildSearchQuery(filters);

  const query = `
    SELECT 
      id, title, description, status, type, sub_type, rooms, area, price,
      images, video, floor_plan, address, city, state, country, latitude, longitude,
      age, bedrooms, bathrooms, features,
      name, username, email, phone,
      user_id, listed_at, nearby
    FROM properties
    ${whereClause}
    ORDER BY listed_at DESC
    OFFSET $${values.length + 1}
    LIMIT $${values.length + 2};
  `;

  const result = await pool.query(query, [...values, skip, limit]);
  return result.rows;
};

// Count filtered properties
exports.countFilteredProperties = async (filters) => {
  const { whereClause, values } = buildSearchQuery(filters);

  const result = await pool.query(
    `SELECT COUNT(*) FROM properties ${whereClause};`,
    values
  );

  return parseInt(result.rows[0].count, 10);
};

// Get property by ID
exports.getPropertyById = async (id) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        id, title, description, status, type, sub_type, rooms, area, price,
        images, video, floor_plan, address, city, state, country, latitude, longitude,
        age, bedrooms, bathrooms, features,
        name, username, email, phone,
        user_id, listed_at, nearby
      FROM properties
      WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error fetching property by ID:", err);
    throw err;
  }
};

exports.getPropertiesByUserId = async (userId) => {
  const query = `SELECT * FROM properties WHERE user_id = $1 ORDER BY created_at DESC`;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};
