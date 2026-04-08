require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes (we'll add these one by one)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/departments", require("./routes/departments"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/schedules", require("./routes/schedules"));
app.use("/api/signage", require("./routes/signage"));
app.use("/api/users", require("./routes/users"));
app.use("/api/specializations", require("./routes/specializations")); // add this line

app.use("/api/seed", require("./routes/seed"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
