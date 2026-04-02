require("dotenv").config();
const pool = require("./config/db");
const bcrypt = require("bcryptjs");

async function seed() {
  try {
    const hashed = await bcrypt.hash("Admin@1234", 10);
    await pool.query(
      `INSERT INTO users (first_name, last_name, username, password, role, department_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (username) DO NOTHING`,
      ["Super", "Admin", "superadmin", hashed, "super_admin", null],
    );
    console.log(
      "Super admin created — username: superadmin, password: Admin@1234",
    );
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
