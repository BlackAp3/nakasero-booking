// Ensures users can only access data within their own department
const departmentIsolation = (req, res, next) => {
  const { role, department_id } = req.user;

  // super_admin and marketing are global — no restriction
  if (role === "super_admin" || role === "marketing") return next();

  // All others — inject their department_id into the request
  if (!department_id) {
    return res.status(403).json({ message: "No department assigned" });
  }

  req.department_id = department_id;
  next();
};

module.exports = departmentIsolation;
