const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");
const departmentIsolation = require("../middleware/department");

// GET /api/patients
router.get("/", authenticate, departmentIsolation, async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const isGlobal = role === "super_admin";

    const result = await pool.query(
      isGlobal
        ? "SELECT * FROM patients ORDER BY name"
        : "SELECT * FROM patients WHERE department_id=$1 ORDER BY name",
      isGlobal ? [] : [department_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/patients/:id
router.get("/:id", authenticate, departmentIsolation, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM patients WHERE patient_id=$1",
      [req.params.id],
    );
    const patient = result.rows[0];
    if (!patient) return res.status(404).json({ message: "Not found" });

    // block cross-department access
    if (
      req.user.role !== "super_admin" &&
      patient.department_id !== req.user.department_id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/patients — receptionist and supervisor
router.post(
  "/",
  authenticate,
  authorize("super_admin", "supervisor", "receptionist"),
  async (req, res) => {
    const {
      name,
      email,
      phone,
      gender,
      next_of_kin_name,
      next_of_kin_phone,
      next_of_kin_relationship,
    } = req.body;

    const department_id =
      req.user.role === "super_admin"
        ? req.body.department_id
        : req.user.department_id;

    try {
      const result = await pool.query(
        `INSERT INTO patients 
        (name, email, phone, gender, next_of_kin_name, next_of_kin_phone, next_of_kin_relationship, department_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [
          name,
          email,
          phone,
          gender,
          next_of_kin_name,
          next_of_kin_phone,
          next_of_kin_relationship,
          department_id,
        ],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PUT /api/patients/:id
router.put(
  "/:id",
  authenticate,
  authorize("super_admin", "supervisor", "receptionist"),
  async (req, res) => {
    const {
      name,
      email,
      phone,
      gender,
      next_of_kin_name,
      next_of_kin_phone,
      next_of_kin_relationship,
    } = req.body;

    try {
      const existing = await pool.query(
        "SELECT * FROM patients WHERE patient_id=$1",
        [req.params.id],
      );
      if (!existing.rows[0])
        return res.status(404).json({ message: "Not found" });

      if (
        req.user.role !== "super_admin" &&
        existing.rows[0].department_id !== req.user.department_id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await pool.query(
        `UPDATE patients SET
        name=$1, email=$2, phone=$3, gender=$4,
        next_of_kin_name=$5, next_of_kin_phone=$6, next_of_kin_relationship=$7
       WHERE patient_id=$8 RETURNING *`,
        [
          name,
          email,
          phone,
          gender,
          next_of_kin_name,
          next_of_kin_phone,
          next_of_kin_relationship,
          req.params.id,
        ],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/patients/:id — super_admin and supervisor only
router.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "supervisor"),
  async (req, res) => {
    try {
      const existing = await pool.query(
        "SELECT * FROM patients WHERE patient_id=$1",
        [req.params.id],
      );
      if (!existing.rows[0])
        return res.status(404).json({ message: "Not found" });

      if (
        req.user.role !== "super_admin" &&
        existing.rows[0].department_id !== req.user.department_id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      await pool.query("DELETE FROM patients WHERE patient_id=$1", [
        req.params.id,
      ]);
      res.json({ message: "Patient deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
