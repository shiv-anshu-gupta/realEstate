require("dotenv").config();
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const { Pool } = require("pg");

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER, // use 'user' instead of 'username'
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false, // add this if connecting to cloud DB like Supabase
  },
});
pool
  .query("SELECT NOW()")
  .then((res) => {
    console.log("✅ Connected to PostgreSQL database at:", res.rows[0].now);
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection failed:", err);
    process.exit(1);
  });

module.exports = pool;
