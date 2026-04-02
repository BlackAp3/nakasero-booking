const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");
const departmentIsolation = require("../middleware/department");

// GET /api/signage/videos/:department_id — public, used by TV display
router.get("/videos/:department_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM signage_videos 
       WHERE department_id=$1 AND is_active=true
       ORDER BY created_at DESC`,
      [req.params.department_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/signage/announcements/:department_id — public, used by TV display
router.get("/announcements/:department_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM announcements 
       WHERE department_id=$1 AND is_active=true
       ORDER BY created_at DESC`,
      [req.params.department_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/signage/videos — marketing and super_admin only
router.post(
  "/videos",
  authenticate,
  authorize("super_admin", "marketing"),
  async (req, res) => {
    const { department_id, title, youtube_url } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO signage_videos (department_id, title, youtube_url, uploaded_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
        [department_id, title, youtube_url, req.user.id],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PUT /api/signage/videos/:id
router.put(
  "/videos/:id",
  authenticate,
  authorize("super_admin", "marketing"),
  async (req, res) => {
    const { title, youtube_url, is_active } = req.body;
    try {
      const result = await pool.query(
        `UPDATE signage_videos SET title=$1, youtube_url=$2, is_active=$3
       WHERE video_id=$4 RETURNING *`,
        [title, youtube_url, is_active, req.params.id],
      );
      if (!result.rows[0])
        return res.status(404).json({ message: "Not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/signage/videos/:id
router.delete(
  "/videos/:id",
  authenticate,
  authorize("super_admin", "marketing"),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM signage_videos WHERE video_id=$1", [
        req.params.id,
      ]);
      res.json({ message: "Video deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// POST /api/signage/announcements
router.post(
  "/announcements",
  authenticate,
  authorize("super_admin", "marketing", "supervisor"),
  async (req, res) => {
    const { department_id, message } = req.body;
    const deptId =
      req.user.role === "supervisor" ? req.user.department_id : department_id;
    try {
      const result = await pool.query(
        `INSERT INTO announcements (department_id, message, created_by)
       VALUES ($1,$2,$3) RETURNING *`,
        [deptId, message, req.user.id],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PUT /api/signage/announcements/:id
router.put(
  "/announcements/:id",
  authenticate,
  authorize("super_admin", "marketing", "supervisor"),
  async (req, res) => {
    const { message, is_active } = req.body;
    try {
      const result = await pool.query(
        `UPDATE announcements SET message=$1, is_active=$2
       WHERE announcement_id=$3 RETURNING *`,
        [message, is_active, req.params.id],
      );
      if (!result.rows[0])
        return res.status(404).json({ message: "Not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/signage/announcements/:id
router.delete(
  "/announcements/:id",
  authenticate,
  authorize("super_admin", "marketing", "supervisor"),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM announcements WHERE announcement_id=$1", [
        req.params.id,
      ]);
      res.json({ message: "Announcement deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
