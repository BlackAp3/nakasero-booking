const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");
const departmentIsolation = require("../middleware/department");

// GET /api/bookings
router.get("/", authenticate, departmentIsolation, async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const isGlobal = role === "super_admin";

    const result = await pool.query(
      isGlobal
        ? `SELECT b.*, p.name as patient_name, d.name as doctor_name, dept.name as department_name
           FROM bookings b
           JOIN patients p ON b.patient_id = p.patient_id
           JOIN doctors d ON b.doctor_id = d.doctor_id
           JOIN departments dept ON b.department_id = dept.department_id
           ORDER BY b.date DESC, b.time ASC`
        : `SELECT b.*, p.name as patient_name, d.name as doctor_name, dept.name as department_name
           FROM bookings b
           JOIN patients p ON b.patient_id = p.patient_id
           JOIN doctors d ON b.doctor_id = d.doctor_id
           JOIN departments dept ON b.department_id = dept.department_id
           WHERE b.department_id=$1
           ORDER BY b.date DESC, b.time ASC`,
      isGlobal ? [] : [department_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/bookings/availability — check if slot is taken
router.get("/availability", authenticate, async (req, res) => {
  const { doctor_id, date } = req.query;
  try {
    const result = await pool.query(
      `SELECT time FROM bookings 
       WHERE doctor_id=$1 AND date=$2 AND status != 'canceled'`,
      [doctor_id, date],
    );
    res.json({ booked_slots: result.rows.map((r) => r.time) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/bookings
router.post(
  "/",
  authenticate,
  authorize("super_admin", "supervisor", "receptionist"),
  async (req, res) => {
    const { patient_id, doctor_id, appointment_type, date, time } = req.body;

    const department_id =
      req.user.role === "super_admin"
        ? req.body.department_id
        : req.user.department_id;

    try {
      // Check slot is not already taken
      const conflict = await pool.query(
        `SELECT booking_id FROM bookings 
       WHERE doctor_id=$1 AND date=$2 AND time=$3 AND status != 'canceled'`,
        [doctor_id, date, time],
      );
      if (conflict.rows.length > 0) {
        return res.status(409).json({ message: "This slot is already booked" });
      }

      const result = await pool.query(
        `INSERT INTO bookings 
        (patient_id, doctor_id, department_id, appointment_type, date, time, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [
          patient_id,
          doctor_id,
          department_id,
          appointment_type,
          date,
          time,
          req.user.id,
        ],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PUT /api/bookings/:id/status — update status only
router.put(
  "/:id/status",
  authenticate,
  authorize("super_admin", "supervisor", "receptionist"),
  async (req, res) => {
    const { status } = req.body;
    try {
      const existing = await pool.query(
        "SELECT * FROM bookings WHERE booking_id=$1",
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
        "UPDATE bookings SET status=$1 WHERE booking_id=$2 RETURNING *",
        [status, req.params.id],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/bookings/:id
router.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "supervisor"),
  async (req, res) => {
    try {
      const existing = await pool.query(
        "SELECT * FROM bookings WHERE booking_id=$1",
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

      await pool.query("DELETE FROM bookings WHERE booking_id=$1", [
        req.params.id,
      ]);
      res.json({ message: "Booking deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
