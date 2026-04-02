import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import api from "../../utils/api";
import { Plus, Pencil, Trash2, Building2, MapPin } from "lucide-react";

const emptyForm = { name: "", location: "" };

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const fetchDepartments = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`/departments/${editing}`, form);
      } else {
        await api.post("/departments", form);
      }
      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving department");
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, location: dept.location || "" });
    setEditing(dept.department_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this department?")) return;
    await api.delete(`/departments/${id}`);
    fetchDepartments();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <Header title="Departments" />

      <main
        style={{
          flex: 1,
          padding: "28px 32px",
          overflowY: "auto",
          background: "#f8fafc",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#0f172a",
                margin: "0 0 2px 0",
              }}
            >
              All Departments
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              {departments.length} department
              {departments.length !== 1 ? "s" : ""} configured
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setForm(emptyForm);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#0a1628",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            <Plus size={15} />
            Add Department
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#0f172a",
                margin: "0 0 20px 0",
              }}
            >
              {editing ? "Edit Department" : "New Department"}
            </h3>
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#dc2626",
                  fontSize: "12px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "6px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. PLAZA, PAED"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "6px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="e.g. East Wing, West Wing"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    background: "#0a1628",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {editing ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    setForm(emptyForm);
                  }}
                  style={{
                    background: "#f8fafc",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Department Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {departments.map((dept, i) => (
            <div
              key={dept.department_id}
              style={{
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #f1f5f9",
                padding: "20px 24px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "80px",
                  height: "80px",
                  background: i % 2 === 0 ? "#f0f9ff" : "#fef9ee",
                  borderRadius: "0 14px 0 80px",
                }}
              />
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: i % 2 === 0 ? "#dbeafe" : "#fef3c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Building2
                  size={18}
                  color={i % 2 === 0 ? "#3b82f6" : "#c8a94a"}
                />
              </div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f172a",
                  margin: "0 0 6px 0",
                }}
              >
                {dept.name}
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginBottom: "16px",
                }}
              >
                <MapPin size={11} color="#94a3b8" />
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {dept.location || "No location set"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "11px", color: "#cbd5e1" }}>
                  Added{" "}
                  {new Date(dept.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => handleEdit(dept)}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "7px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Pencil size={13} color="#64748b" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.department_id)}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "7px",
                      border: "1px solid #fee2e2",
                      background: "#fef2f2",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={13} color="#dc2626" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {departments.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "60px",
                textAlign: "center",
                color: "#cbd5e1",
                fontSize: "13px",
              }}
            >
              No departments yet — add your first one
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        input:focus { border-color: #0a1628 !important; box-shadow: 0 0 0 3px rgba(10,22,40,0.08); }
      `}</style>
    </div>
  );
};

export default Departments;
