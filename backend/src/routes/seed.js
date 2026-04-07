const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// POST /api/seed — inserts test patients and bookings
// Query params: 
//   ?clean=true - truncates existing data first
//   ?patients=50 - number of patients (default: 50)
//   ?bookings=80 - number of bookings (default: 80)
//   ?force=true - bypass production safety check (use with caution)
router.post("/", async (req, res) => {
  const client = await pool.connect();
  const startTime = Date.now();

  try {
    // ── 0. Environment safety check ────────────────────────────────────────
    if (process.env.NODE_ENV === 'production' && !req.query.force) {
      return res.status(403).json({
        success: false,
        message: "Seed endpoint is disabled in production. Use ?force=true to override."
      });
    }

    // Configuration with defaults
    const config = {
      patientCount: parseInt(req.query.patients) || 50,
      bookingCount: parseInt(req.query.bookings) || 80,
      dateRangeStart: parseInt(req.query.dateStart) || -60,
      dateRangeEnd: parseInt(req.query.dateEnd) || 30,
      clean: req.query.clean === 'true'
    };

    // Validate config
    if (config.patientCount < 1 || config.patientCount > 1000) {
      return res.status(400).json({
        success: false,
        message: "Patient count must be between 1 and 1000"
      });
    }

    if (config.bookingCount < 0 || config.bookingCount > 5000) {
      return res.status(400).json({
        success: false,
        message: "Booking count must be between 0 and 5000"
      });
    }

    await client.query('BEGIN');

    // ── 1. Clean existing data if requested ───────────────────────────────
    if (config.clean) {
      console.log('🧹 Cleaning existing data...');
      await client.query('TRUNCATE bookings, patients RESTART IDENTITY CASCADE');
      console.log('✅ Data cleaned successfully');
    }

    // ── 2. Require departments & doctors to already exist ─────────────────
    const deptResult = await client.query(
      "SELECT department_id FROM departments ORDER BY department_id"
    );
    if (deptResult.rows.length === 0) {
      throw new Error("Create at least one department first.");
    }
    const deptIds = deptResult.rows.map((r) => r.department_id);

    const docResult = await client.query(
      `SELECT doctor_id, department_id 
       FROM doctors 
       ORDER BY doctor_id`
    );
    if (docResult.rows.length === 0) {
      throw new Error("Create at least one doctor first.");
    }
    const doctors = docResult.rows;

    const userResult = await client.query(
      "SELECT id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1"
    );
    if (userResult.rows.length === 0) {
      throw new Error("No admin user found. Please create an admin user first.");
    }
    const createdBy = userResult.rows[0].id;

    console.log(`📋 Found: ${deptIds.length} departments, ${doctors.length} doctors`);

    // ── 3. Build patients with bulk insert ───────────────────────────────
    const firstNames = [
      "Amara", "Kato", "Naledi", "Okello", "Zawadi", "Fatuma", "Moses", "Grace",
      "David", "Sarah", "John", "Mary", "Peter", "Alice", "James", "Naomi",
      "Samuel", "Ruth", "Daniel", "Esther", "Joseph", "Miriam", "Isaac", "Deborah",
      "Michael", "Lydia", "Paul", "Hannah", "Stephen", "Judith", "Thomas", "Beatrice",
      "Andrew", "Florence", "Philip", "Doris", "Timothy", "Agnes", "Emmanuel", "Rose",
      "Charles", "Priscilla", "Henry", "Juliet", "Robert", "Christine", "George",
      "Patricia", "William", "Elizabeth",
    ];

    const lastNames = [
      "Nakamura", "Ochieng", "Muteba", "Ssemwogerere", "Kyambadde", "Nanteza",
      "Wasswa", "Nakibuuka", "Mugisha", "Nsubuga", "Kabuubi", "Nalwanga", "Sentamu",
      "Namusoke", "Kibuuka", "Lukwago", "Nanyonga", "Ssekandi", "Kivumbi", "Nabirye",
    ];

    const genders = ["Male", "Female", "Male", "Female", "Male", "Female", "Other"];
    const kinRels = ["Spouse", "Parent", "Sibling", "Child", "Friend", "Guardian"];

    console.log(`👥 Generating ${config.patientCount} patients...`);

    const patientValues = [];
    const patientParams = [];
    let paramCounter = 1;

    for (let i = 0; i < config.patientCount; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const name = `${firstName} ${lastName}`;
      const phone = `+2567${String(10000000 + i * 97531).padStart(8, "0").slice(0, 8)}`;
      const email = `${firstName.toLowerCase()}${i}@example.com`;
      const gender = genders[i % genders.length];
      const deptId = deptIds[i % deptIds.length];
      const kinName = `${firstNames[(i + 7) % firstNames.length]} ${lastNames[(i + 4) % lastNames.length]}`;
      const kinPhone = `+2567${String(20000000 + i * 13579).padStart(8, "0").slice(0, 8)}`;
      const kinRel = kinRels[i % kinRels.length];

      patientParams.push(
        name, email, phone, gender, kinName, kinPhone, kinRel, deptId
      );

      patientValues.push(
        `($${paramCounter}, $${paramCounter + 1}, $${paramCounter + 2}, $${paramCounter + 3}, 
          $${paramCounter + 4}, $${paramCounter + 5}, $${paramCounter + 6}, $${paramCounter + 7})`
          .replace(/\s+/g, ' ')
      );
      
      paramCounter += 8;
    }

    const patientInsertQuery = `
      INSERT INTO patients 
        (name, email, phone, gender, next_of_kin_name, next_of_kin_phone, 
         next_of_kin_relationship, department_id)
      VALUES ${patientValues.join(', ')} 
      RETURNING patient_id
    `;

    const patientResult = await client.query(patientInsertQuery, patientParams);
    const patientIds = patientResult.rows.map(r => r.patient_id);

    console.log(`✅ Created ${patientIds.length} patients`);

    // ── 4. Build bookings with batch insert ───────────────────────────────
    if (config.bookingCount > 0) {
      console.log(`📅 Generating ~${config.bookingCount} bookings...`);

      const apptTypes = [
        "Consultation", "Follow-up", "Check-up", "Referral", "Emergency",
        "Vaccination", "Lab Results", "Surgery Prep", "Physiotherapy", "Mental Health",
      ];

      const times = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
      ];

      const statuses = ["pending", "confirmed", "confirmed", "confirmed", "canceled"];

      // Generate dates
      const today = new Date();
      const dates = [];
      for (let d = config.dateRangeStart; d <= config.dateRangeEnd; d += 2) {
        const dt = new Date(today);
        dt.setDate(today.getDate() + d);
        dates.push(dt.toISOString().split("T")[0]);
      }

      const usedSlots = new Set();
      const bookingValues = [];
      const bookingParams = [];
      let bookingCounter = 1;
      let bookingCount = 0;
      let attempts = 0;
      const maxAttempts = config.bookingCount * 10;

      while (bookingCount < config.bookingCount && attempts < maxAttempts) {
        attempts++;
        
        const doc = doctors[attempts % doctors.length];
        const patId = patientIds[Math.floor(Math.random() * patientIds.length)];
        const date = dates[Math.floor(Math.random() * dates.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        const slotKey = `${doc.doctor_id}|${date}|${time}`;

        if (usedSlots.has(slotKey)) continue;

        const deptId = doc.department_id ?? deptIds[0];
        const apptType = apptTypes[bookingCount % apptTypes.length];
        const status = statuses[bookingCount % statuses.length];

        // Add to batch
        bookingParams.push(
          patId, doc.doctor_id, deptId, apptType, date, time,
          status, createdBy
        );

        bookingValues.push(
          `($${bookingCounter}, $${bookingCounter + 1}, $${bookingCounter + 2}, 
            $${bookingCounter + 3}, $${bookingCounter + 4}, $${bookingCounter + 5}, 
            $${bookingCounter + 6}, $${bookingCounter + 7})`.replace(/\s+/g, ' ')
        );

        bookingCounter += 8;
        usedSlots.add(slotKey);
        bookingCount++;
      }

      if (bookingValues.length > 0) {
        const bookingInsertQuery = `
          INSERT INTO bookings
            (patient_id, doctor_id, department_id, appointment_type,
             date, time, status, created_by)
          VALUES ${bookingValues.join(', ')}
        `;

        await client.query(bookingInsertQuery, bookingParams);
      }

      console.log(`✅ Created ${bookingCount} bookings (${attempts} attempts)`);
    }

    await client.query('COMMIT');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    res.json({
      success: true,
      message: `Successfully seeded ${patientIds.length} patients and ${config.bookingCount} bookings in ${duration}s`,
      data: {
        patients: patientIds.length,
        bookings: config.bookingCount,
        duration: `${duration}s`,
        departments: deptIds.length,
        doctors: doctors.length
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', err);

    res.status(err.message.includes('first') ? 400 : 500).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } finally {
    client.release();
  }
});

// GET /api/seed/stats - Get current data statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM patients) as patient_count,
        (SELECT COUNT(*) FROM bookings) as booking_count,
        (SELECT COUNT(*) FROM departments) as department_count,
        (SELECT COUNT(*) FROM doctors) as doctor_count,
        (SELECT COUNT(*) FROM users) as user_count
    `);

    const bookingStatus = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM bookings 
      GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        counts: stats.rows[0],
        booking_statuses: bookingStatus.rows
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// DELETE /api/seed/clean - Clean all test data
router.delete("/clean", async (req, res) => {
  const client = await pool.connect();

  try {
    // Safety check for production
    if (process.env.NODE_ENV === 'production' && !req.query.force) {
      return res.status(403).json({
        success: false,
        message: "Clean endpoint is disabled in production. Use ?force=true to override."
      });
    }

    await client.query('BEGIN');

    const before = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM patients) as patients,
        (SELECT COUNT(*) FROM bookings) as bookings
    `);

    await client.query('TRUNCATE bookings, patients RESTART IDENTITY CASCADE');

    await client.query('COMMIT');

    res.json({
      success: true,
      message: "All test data cleaned successfully",
      data: {
        removed: {
          patients: parseInt(before.rows[0].patients),
          bookings: parseInt(before.rows[0].bookings)
        }
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Clean error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;