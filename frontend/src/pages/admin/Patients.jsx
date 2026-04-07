import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Plus, Pencil, Trash2, Search, User, ChevronLeft, ChevronRight } from "lucide-react";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  next_of_kin_name: "",
  next_of_kin_phone: "",
  next_of_kin_relationship: "",
  department_id: "",
};

const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAll = async () => {
    const [p, d] = await Promise.all([
      api.get("/patients"),
      api.get("/departments"),
    ]);
    setPatients(p.data);
    setDepartments(d.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filter patients based on search
  const filtered = patients.filter((p) =>
    `${p.name} ${p.phone}`.toLowerCase().includes(search.toLowerCase()),
  );

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [filtered.length, itemsPerPage, search]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form };
      if (user.role !== "super_admin") delete payload.department_id;
      if (editing) {
        await api.put(`/patients/${editing}`, payload);
      } else {
        await api.post("/patients", payload);
      }
      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving patient");
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      email: p.email || "",
      phone: p.phone,
      gender: p.gender || "",
      next_of_kin_name: p.next_of_kin_name,
      next_of_kin_phone: p.next_of_kin_phone,
      next_of_kin_relationship: p.next_of_kin_relationship,
      department_id: p.department_id,
    });
    setEditing(p.patient_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this patient?")) return;
    await api.delete(`/patients/${id}`);
    fetchAll();
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "#fff",
  };

  const genderColors = {
    Male: { bg: "#dbeafe", text: "#1e40af" },
    Female: { bg: "#fce7f3", text: "#9d174d" },
    Other: { bg: "#f3f4f6", text: "#374151" },
  };

  // Pagination component
  const Pagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderTop: "1px solid #f1f5f9",
          background: "#fff",
        }}
      >
        <div style={{ fontSize: "13px", color: "#64748b" }}>
          Showing {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} patients
        </div>
        
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "7px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={14} color="#64748b" />
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                style={{
                  minWidth: "32px",
                  height: "32px",
                  padding: "0 8px",
                  borderRadius: "7px",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: "500",
                }}
              >
                1
              </button>
              {startPage > 2 && (
                <span style={{ color: "#cbd5e1", fontSize: "13px" }}>...</span>
              )}
            </>
          )}
          
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                minWidth: "32px",
                height: "32px",
                padding: "0 8px",
                borderRadius: "7px",
                border: currentPage === page ? "none" : "1px solid #e2e8f0",
                background: currentPage === page ? "#0a1628" : "#fff",
                cursor: "pointer",
                fontSize: "13px",
                color: currentPage === page ? "#fff" : "#64748b",
                fontWeight: currentPage === page ? "600" : "500",
              }}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span style={{ color: "#cbd5e1", fontSize: "13px" }}>...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                style={{
                  minWidth: "32px",
                  height: "32px",
                  padding: "0 8px",
                  borderRadius: "7px",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: "500",
                }}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "7px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            <ChevronRight size={14} color="#64748b" />
          </button>
        </div>
      </div>
    );
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
      <Header title="Patients" />

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
              Patients
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              {patients.length} patient{patients.length !== 1 ? "s" : ""}{" "}
              registered
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "36px", width: "240px" }}
              />
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
              }}
            >
              <Plus size={15} /> Register Patient
            </button>
          </div>
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
              {editing ? "Edit Patient" : "Register New Patient"}
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
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 12px 0",
                }}
              >
                Personal Info
              </p>
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
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
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
                    }}
                  >
                    Phone
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
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
                    }}
                  >
                    Email
                  </label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
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
                    }}
                  >
                    Gender
                  </label>
                  <select
                    style={inputStyle}
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {user.role === "super_admin" && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Department
                    </label>
                    <select
                      style={inputStyle}
                      value={form.department_id}
                      onChange={(e) =>
                        setForm({ ...form, department_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d.department_id} value={d.department_id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 12px 0",
                }}
              >
                Next of Kin
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
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
                    }}
                  >
                    Name
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.next_of_kin_name}
                    onChange={(e) =>
                      setForm({ ...form, next_of_kin_name: e.target.value })
                    }
                    required
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
                    }}
                  >
                    Phone
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.next_of_kin_phone}
                    onChange={(e) =>
                      setForm({ ...form, next_of_kin_phone: e.target.value })
                    }
                    required
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
                    }}
                  >
                    Relationship
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.next_of_kin_relationship}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        next_of_kin_relationship: e.target.value,
                      })
                    }
                    required
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
                  {editing ? "Update" : "Register"}
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

        {/* Table */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #f1f5f9",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {[
                  "Patient",
                  "Phone",
                  "Gender",
                  "Next of Kin",
                  "Department",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      color: "#94a3b8",
                      fontWeight: "600",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getCurrentPageItems().map((p, i) => (
                <tr
                  key={p.patient_id}
                  style={{
                    borderTop: "1px solid #f8fafc",
                    background: i % 2 === 0 ? "#fff" : "#fafbfc",
                  }}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background:
                            p.gender === "Female" ? "#fce7f3" : "#dbeafe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <User
                          size={14}
                          color={p.gender === "Female" ? "#9d174d" : "#1e40af"}
                        />
                      </div>
                      <span style={{ fontWeight: "600", color: "#0f172a" }}>
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#64748b" }}>
                    {p.phone}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    {p.gender ? (
                      <span
                        style={{
                          background: genderColors[p.gender]?.bg || "#f3f4f6",
                          color: genderColors[p.gender]?.text || "#374151",
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "3px 10px",
                          borderRadius: "20px",
                        }}
                      >
                        {p.gender}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#64748b" }}>
                    <span style={{ fontWeight: "500", color: "#374151" }}>
                      {p.next_of_kin_name}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                      {" "}
                      · {p.next_of_kin_relationship}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        background: "#eff6ff",
                        color: "#3b82f6",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "3px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {departments.find(
                        (d) => d.department_id === p.department_id,
                      )?.name || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => handleEdit(p)}
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
                        onClick={() => handleDelete(p.patient_id)}
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
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#cbd5e1",
                      fontSize: "13px",
                    }}
                  >
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filtered.length > 0 && <Pagination />}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        input:focus, select:focus { border-color: #0a1628 !important; box-shadow: 0 0 0 3px rgba(10,22,40,0.08); }
      `}</style>
    </div>
  );
};

export default Patients;