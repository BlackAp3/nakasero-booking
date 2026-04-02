const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");
const departmentIsolation = require("../middleware/department");

// GET /api/schedules — get schedules (filtered by department)
router.get("/", authenticate, departmentIsolation, async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const isGlobal = role === "super_admin" || role === "marketing";

    const result = await pool.query(
      isGlobal
        ? `SELECT ds.*, d.name as doctor_name, d.specialization, d.room, d.photo, d.department_id
           FROM doctor_schedules ds
           JOIN doctors d ON ds.doctor_id = d.doctor_id
           ORDER BY d.name, ds.day_of_week`
        : `SELECT ds.*, d.name as doctor_name, d.specialization, d.room, d.photo, d.department_id
           FROM doctor_schedules ds
           JOIN doctors d ON ds.doctor_id = d.doctor_id
           WHERE d.department_id=$1
           ORDER BY d.name, ds.day_of_week`,
      isGlobal ? [] : [department_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/schedules/today/:department_id — for TV signage display
router.get("/today/:department_id", async (req, res) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = days[new Date().getDay()];

  try {
    const result = await pool.query(
      `SELECT ds.*, d.name as doctor_name, d.specialization, d.room, d.photo
       FROM doctor_schedules ds
       JOIN doctors d ON ds.doctor_id = d.doctor_id
       WHERE d.department_id=$1 AND ds.day_of_week=$2 AND ds.is_active=true
       ORDER BY ds.start_time`,
      [req.params.department_id, today],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/schedules — supervisor and super_admin only
router.post(
  "/",
  authenticate,
  authorize("super_admin", "supervisor", "receptionist"),
  async (req, res) => {
    const { doctor_id, day_of_week, start_time, end_time } = req.body;

    try {
      // verify doctor belongs to user's department
      if (req.user.role !== "super_admin") {
        const doctor = await pool.query(
          "SELECT * FROM doctors WHERE doctor_id=$1",
          [doctor_id],
        );
        if (
          !doctor.rows[0] ||
          doctor.rows[0].department_id !== req.user.department_id
        ) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const result = await pool.query(
        `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
       VALUES ($1,$2,$3,$4) RETURNING *`,
        [doctor_id, day_of_week, start_time, end_time],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PUT /api/schedules/:id
router.put(
  "/:id",
  authenticate,
  authorize("super_admin", "supervisor", "receptionist"),
  async (req, res) => {
    const { day_of_week, start_time, end_time, is_active } = req.body;

    try {
      const existing = await pool.query(
        `SELECT ds.*, d.department_id FROM doctor_schedules ds
       JOIN doctors d ON ds.doctor_id = d.doctor_id
       WHERE ds.schedule_id=$1`,
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
        `UPDATE doctor_schedules SET day_of_week=$1, start_time=$2, end_time=$3, is_active=$4
       WHERE schedule_id=$5 RETURNING *`,
        [day_of_week, start_time, end_time, is_active, req.params.id],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/schedules/:id
router.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "supervisor"),
  async (req, res) => {
    try {
      const existing = await pool.query(
        `SELECT ds.*, d.department_id FROM doctor_schedules ds
       JOIN doctors d ON ds.doctor_id = d.doctor_id
       WHERE ds.schedule_id=$1`,
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

      await pool.query("DELETE FROM doctor_schedules WHERE schedule_id=$1", [
        req.params.id,
      ]);
      res.json({ message: "Schedule deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
