import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Plus, Pencil, Trash2, Search, Stethoscope, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";

const TITLES = ["Dr.", "Mr.", "Mrs.", "Ms.", "Prof."];

const emptyForm = {
  title: "",
  first_name: "",
  other_name: "",
  last_name: "",
  specialization: "",
  category: "",
  room: "",
  department_id: "",
  photo: null,
};

const Doctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAll = async () => {
    const [d, dept] = await Promise.all([
      api.get("/doctors"),
      api.get("/departments"),
    ]);
    setDoctors(d.data);
    setDepartments(dept.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, photo: file });
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = new FormData();
      const fullName = [form.title, form.first_name, form.other_name, form.last_name]
        .filter(Boolean)
        .join(" ");
      data.append("name", fullName);
      data.append("specialization", form.specialization);
      data.append("category", form.category);
      data.append("room", form.room);
      data.append(
        "department_id",
        user.role === "supervisor" ? user.department_id : form.department_id,
      );
      if (form.photo) data.append("photo", form.photo);
      if (editing) {
        await api.put(`/doctors/${editing}`, data);
      } else {
        await api.post("/doctors", data);
      }
      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      setPreview(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving doctor");
    }
  };

  const handleEdit = (doc) => {
    const parts = (doc.name || "").split(" ");
    let title = "";
    let rest = parts;
    if (parts.length > 0 && TITLES.includes(parts[0])) {
      title = parts[0];
      rest = parts.slice(1);
    }
    const first_name = rest[0] || "";
    const last_name = rest.length > 1 ? rest[rest.length - 1] : "";
    const other_name = rest.length > 2 ? rest.slice(1, -1).join(" ") : "";
    setForm({
      title,
      first_name,
      other_name,
      last_name,
      specialization: doc.specialization,
      category: doc.category || "",
      room: doc.room || "",
      department_id: doc.department_id,
      photo: null,
    });
    setPreview(doc.photo ? `http://localhost:5001${doc.photo}` : null);
    setEditing(doc.doctor_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this doctor?")) return;
    await api.delete(`/doctors/${id}`);
    fetchAll();
  };

  const filtered = doctors.filter((d) =>
    `${d.name} ${d.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
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
          padding: "16px 0",
          marginTop: "20px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <div style={{ fontSize: "13px", color: "#64748b" }}>
          Showing {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} doctors
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
      <Header title="Doctors" />

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
              Doctors
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              {doctors.length} doctor{doctors.length !== 1 ? "s" : ""}{" "}
              registered
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* View toggle */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: "#f1f5f9",
                padding: "3px",
                borderRadius: "8px",
              }}
            >
              <button
                onClick={() => setViewMode("cards")}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: viewMode === "cards" ? "#fff" : "transparent",
                  color: viewMode === "cards" ? "#0a1628" : "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: "600",
                  boxShadow: viewMode === "cards" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <Grid size={14} /> Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: viewMode === "table" ? "#fff" : "transparent",
                  color: viewMode === "table" ? "#0a1628" : "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: "600",
                  boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <List size={14} /> List
              </button>
            </div>
            
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
                placeholder="Search doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "36px", width: "220px" }}
              />
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditing(null);
                setForm(emptyForm);
                setPreview(null);
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
              <Plus size={15} /> Add Doctor
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
              {editing ? "Edit Doctor" : "New Doctor"}
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
              {/* Name row: Title + First Name + Other Name + Last Name */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr 1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
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
                    Title
                  </label>
                  <select
                    style={inputStyle}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  >
                    <option value="">No Title</option>
                    {TITLES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
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
                    First Name
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
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
                    Other Name
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.other_name}
                    onChange={(e) => setForm({ ...form, other_name: e.target.value })}
                    placeholder="Optional"
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
                    Last Name
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
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
                    Specialization
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.specialization}
                    onChange={(e) =>
                      setForm({ ...form, specialization: e.target.value })
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
                    Category
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
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
                    Room
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                  />
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
                    Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ ...inputStyle, padding: "8px 14px" }}
                  />
                  {preview && (
                    <img
                      src={preview}
                      alt="preview"
                      style={{
                        marginTop: "8px",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #e2e8f0",
                      }}
                    />
                  )}
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
                    setPreview(null);
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

        {/* Content based on view mode */}
        {viewMode === "cards" ? (
          <>
            {/* Doctor Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {getCurrentPageItems().map((doc) => (
                <div
                  key={doc.doctor_id}
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    border: "1px solid #f1f5f9",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {/* Photo + Name */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "14px" }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        border: "2px solid #e2e8f0",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#0a1628",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {doc.photo ? (
                        <img
                          src={`http://localhost:5001${doc.photo}`}
                          alt={doc.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            color: "#c8a94a",
                            fontSize: "16px",
                            fontWeight: "700",
                          }}
                        >
                          {doc.name[0]}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: "700",
                          color: "#0f172a",
                          fontSize: "14px",
                          margin: "0 0 2px 0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {doc.name}
                      </p>
                      <p
                        style={{
                          color: "#6366f1",
                          fontSize: "12px",
                          fontWeight: "500",
                          margin: 0,
                        }}
                      >
                        {doc.specialization}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: "8px",
                        padding: "8px 10px",
                      }}
                    >
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "10px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          margin: "0 0 2px 0",
                        }}
                      >
                        Room
                      </p>
                      <p
                        style={{
                          color: "#0f172a",
                          fontSize: "12px",
                          fontWeight: "600",
                          margin: 0,
                        }}
                      >
                        {doc.room || "—"}
                      </p>
                    </div>
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: "8px",
                        padding: "8px 10px",
                      }}
                    >
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "10px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          margin: "0 0 2px 0",
                        }}
                      >
                        Category
                      </p>
                      <p
                        style={{
                          color: "#0f172a",
                          fontSize: "12px",
                          fontWeight: "600",
                          margin: 0,
                        }}
                      >
                        {doc.category || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Dept + Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
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
                        (d) => d.department_id === doc.department_id,
                      )?.name || "—"}
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleEdit(doc)}
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
                        onClick={() => handleDelete(doc.doctor_id)}
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
              {filtered.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "60px",
                    textAlign: "center",
                    color: "#cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  No doctors found
                </div>
              )}
            </div>
            {filtered.length > 0 && <Pagination />}
          </>
        ) : (
          <>
            {/* Table View */}
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
                    {["Doctor", "Specialization", "Category", "Room", "Department", ""].map((h) => (
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
                  {getCurrentPageItems().map((doc, i) => (
                    <tr
                      key={doc.doctor_id}
                      style={{
                        borderTop: "1px solid #f8fafc",
                        background: i % 2 === 0 ? "#fff" : "#fafbfc",
                      }}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              border: "2px solid #e2e8f0",
                              overflow: "hidden",
                              flexShrink: 0,
                              background: "#0a1628",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {doc.photo ? (
                              <img
                                src={`http://localhost:5001${doc.photo}`}
                                alt={doc.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  color: "#c8a94a",
                                  fontSize: "14px",
                                  fontWeight: "700",
                                }}
                              >
                                {doc.name[0]}
                              </span>
                            )}
                          </div>
                          <span style={{ fontWeight: "600", color: "#0f172a" }}>
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", color: "#6366f1", fontWeight: "500" }}>
                        {doc.specialization}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#64748b" }}>
                        {doc.category || "—"}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#64748b" }}>
                        {doc.room || "—"}
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
                            (d) => d.department_id === doc.department_id,
                          )?.name || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleEdit(doc)}
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
                            onClick={() => handleDelete(doc.doctor_id)}
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
                          padding: "60px",
                          textAlign: "center",
                          color: "#cbd5e1",
                          fontSize: "13px",
                        }}
                      >
                        No doctors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {filtered.length > 0 && <Pagination />}
            </div>
          </>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        input:focus, select:focus { border-color: #0a1628 !important; box-shadow: 0 0 0 3px rgba(10,22,40,0.08); }
      `}</style>
    </div>
  );
};

export default Doctors;