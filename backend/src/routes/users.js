const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/users — super_admin sees all, supervisor sees their department only
router.get(
  "/",
  authenticate,
  authorize("super_admin", "supervisor"),
  async (req, res) => {
    try {
      const { role, department_id } = req.user;
      const isGlobal = role === "super_admin";

      const result = await pool.query(
        isGlobal
          ? `SELECT id, first_name, last_name, username, role, department_id, created_at
           FROM users ORDER BY created_at DESC`
          : `SELECT id, first_name, last_name, username, role, department_id, created_at
           FROM users WHERE department_id=$1 ORDER BY created_at DESC`,
        isGlobal ? [] : [department_id],
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// POST /api/users — super_admin creates any role, supervisor creates receptionist only
router.post(
  "/",
  authenticate,
  authorize("super_admin", "supervisor"),
  async (req, res) => {
    const { first_name, last_name, username, password, role, department_id } =
      req.body;

    // supervisors can only create receptionists in their own department
    if (req.user.role === "supervisor") {
      if (role !== "receptionist") {
        return res
          .status(403)
          .json({ message: "Supervisors can only create receptionists" });
      }
      if (parseInt(department_id) !== req.user.department_id) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    try {
      const hashed = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users (first_name, last_name, username, password, role, department_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, first_name, last_name, username, role, department_id, created_at`,
        [first_name, last_name, username, hashed, role, department_id || null],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505")
        return res.status(409).json({ message: "Username already exists" });
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PUT /api/users/:id
router.put(
  "/:id",
  authenticate,
  authorize("super_admin", "supervisor"),
  async (req, res) => {
    const { first_name, last_name, username, password, role, department_id } =
      req.body;

    try {
      const existing = await pool.query("SELECT * FROM users WHERE id=$1", [
        req.params.id,
      ]);
      if (!existing.rows[0])
        return res.status(404).json({ message: "Not found" });

      if (
        req.user.role === "supervisor" &&
        existing.rows[0].department_id !== req.user.department_id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      const hashed = password
        ? await bcrypt.hash(password, 10)
        : existing.rows[0].password;

      const result = await pool.query(
        `UPDATE users SET first_name=$1, last_name=$2, username=$3, password=$4, role=$5, department_id=$6
       WHERE id=$7 RETURNING id, first_name, last_name, username, role, department_id, created_at`,
        [
          first_name,
          last_name,
          username,
          hashed,
          role,
          department_id || null,
          req.params.id,
        ],
      );
      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505")
        return res.status(409).json({ message: "Username already exists" });
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/users/:id — super_admin only
router.delete(
  "/:id",
  authenticate,
  authorize("super_admin"),
  async (req, res) => {
    try {
      if (req.user.id === parseInt(req.params.id)) {
        return res
          .status(400)
          .json({ message: "Cannot delete your own account" });
      }
      await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
      res.json({ message: "User deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
