const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/specializations - Get all specializations
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM specializations ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/specializations - Create new specialization
router.post("/", authenticate, authorize("super_admin", "supervisor"), async (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Specialization name is required" });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO specializations (name) VALUES ($1) RETURNING *`,
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: "Specialization already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/specializations/:id - Update specialization
router.put("/:id", authenticate, authorize("super_admin", "supervisor"), async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  
  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Specialization name is required" });
  }
  
  try {
    const result = await pool.query(
      `UPDATE specializations SET name = $1 WHERE specialization_id = $2 RETURNING *`,
      [name.trim(), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Specialization not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: "Specialization name already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/specializations/:id - Delete specialization
router.delete("/:id", authenticate, authorize("super_admin"), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if any doctors use this specialization
    const usageCheck = await pool.query(
      "SELECT COUNT(*) FROM doctors WHERE specialization = (SELECT name FROM specializations WHERE specialization_id = $1)",
      [id]
    );
    
    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: "Cannot delete specialization that is assigned to doctors" 
      });
    }
    
    const result = await pool.query(
      "DELETE FROM specializations WHERE specialization_id = $1 RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Specialization not found" });
    }
    
    res.json({ message: "Specialization deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;