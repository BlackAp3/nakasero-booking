const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");
const departmentIsolation = require("../middleware/department");
const multer = require("multer");
const path = require("path");

// Photo upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../../uploads/doctors")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// GET /api/doctors
router.get("/", authenticate, departmentIsolation, async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const isGlobal = role === "super_admin" || role === "marketing";

    const result = await pool.query(
      isGlobal
        ? "SELECT * FROM doctors ORDER BY name"
        : "SELECT * FROM doctors WHERE department_id=$1 ORDER BY name",
      isGlobal ? [] : [department_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/doctors — supervisor and super_admin only
router.post(
  "/",
  authenticate,
  authorize("super_admin", "supervisor"),
  upload.single("photo"),
  async (req, res) => {
    const { name, specialization, category, room, department_id } = req.body;
    const photo = req.file ? `/uploads/doctors/${req.file.filename}` : null;

    // supervisors can only add to their own department
    const deptId =
      req.user.role === "supervisor" ? req.user.department_id : department_id;

    try {
      const result = await pool.query(
        "INSERT INTO doctors (name, specialization, category, room, photo, department_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [name, specialization, category, room, photo, deptId],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PUT /api/doctors/:id
router.put(
  "/:id",
  authenticate,
  authorize("super_admin", "supervisor"),
  upload.single("photo"),
  async (req, res) => {
    const { name, specialization, category, room } = req.body;
    const photo = req.file ? `/uploads/doctors/${req.file.filename}` : null;

    try {
      const existing = await pool.query(
        "SELECT * FROM doctors WHERE doctor_id=$1",
        [req.params.id],
      );
      if (!existing.rows[0])
        return res.status(404).json({ message: "Not found" });

      // supervisor can only edit their department's doctors
      if (
        req.user.role === "supervisor" &&
        existing.rows[0].department_id !== req.user.department_id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedPhoto = photo || existing.rows[0].photo;

      const result = await pool.query(
        "UPDATE doctors SET name=$1, specialization=$2, category=$3, room=$4, photo=$5 WHERE doctor_id=$6 RETURNING *",
        [name, specialization, category, room, updatedPhoto, req.params.id],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/doctors/:id
router.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "supervisor"),
  async (req, res) => {
    try {
      const existing = await pool.query(
        "SELECT * FROM doctors WHERE doctor_id=$1",
        [req.params.id],
      );
      if (!existing.rows[0])
        return res.status(404).json({ message: "Not found" });

      if (
        req.user.role === "supervisor" &&
        existing.rows[0].department_id !== req.user.department_id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      await pool.query("DELETE FROM doctors WHERE doctor_id=$1", [
        req.params.id,
      ]);
      res.json({ message: "Doctor deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
