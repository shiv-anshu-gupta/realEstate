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

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
  process.exit(-1);
});

module.exports = pool;
