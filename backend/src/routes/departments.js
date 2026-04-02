const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/departments — all roles can read
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/departments — super_admin only
router.post("/", authenticate, authorize("super_admin"), async (req, res) => {
  const { name, location } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO departments (name, location) VALUES ($1, $2) RETURNING *",
      [name, location],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/departments/:id — super_admin only
router.put("/:id", authenticate, authorize("super_admin"), async (req, res) => {
  const { name, location } = req.body;
  try {
    const result = await pool.query(
      "UPDATE departments SET name=$1, location=$2 WHERE department_id=$3 RETURNING *",
      [name, location, req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ message: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/departments/:id — super_admin only
router.delete(
  "/:id",
  authenticate,
  authorize("super_admin"),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM departments WHERE department_id=$1", [
        req.params.id,
      ]);
      res.json({ message: "Department deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
