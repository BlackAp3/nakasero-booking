import { useEffect, useState, useRef } from "react";
import Header from "../../components/layout/Header";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2, Search, Calendar, Clock, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";

const emptyForm = {
  patient_id: "",
  doctor_id: "",
  appointment_type: "",
  date: "",
  time: "",
  department_id: "",
};

const statusConfig = {
  pending: { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  confirmed: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
  canceled: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};

// Custom Searchable Select Component
const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  required,
  displayKey = "name",
  valueKey = "id",
  secondaryKey = null,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const selectedOption = options.find(opt => opt[valueKey] == value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    const searchLower = searchTerm.toLowerCase();
    const primaryMatch = opt[displayKey]?.toLowerCase().includes(searchLower);
    const secondaryMatch = secondaryKey ? opt[secondaryKey]?.toLowerCase().includes(searchLower) : false;
    return primaryMatch || secondaryMatch;
  });

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          width: "100%",
          padding: "10px 14px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          fontSize: "13px",
          color: selectedOption ? "#0f172a" : "#94a3b8",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: disabled ? "#f8fafc" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "41px"
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption 
            ? secondaryKey 
              ? `${selectedOption[displayKey]} — ${selectedOption[secondaryKey]}`
              : selectedOption[displayKey]
            : placeholder}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {value && !disabled && (
            <X
              size={14}
              color="#94a3b8"
              style={{ cursor: "pointer" }}
              onClick={handleClear}
              onMouseEnter={(e) => e.currentTarget.style.color = "#64748b"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
            />
          )}
          <ChevronDown
            size={14}
            color="#94a3b8"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s"
            }}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            maxHeight: "300px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 8px 8px 32px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          <div style={{ overflowY: "auto", maxHeight: "250px" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: value == option[valueKey] ? "#0a1628" : "#0f172a",
                    background: value == option[valueKey] ? "#f8fafc" : "transparent",
                    fontWeight: value == option[valueKey] ? "600" : "400",
                    borderBottom: "1px solid #f8fafc",
                    transition: "background 0.15s"
                  }}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={(e) => {
                    if (value != option[valueKey]) {
                      e.currentTarget.style.background = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value != option[valueKey]) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {option[displayKey]}
                  {secondaryKey && option[secondaryKey] && (
                    <span style={{ color: "#94a3b8", fontSize: "11px", marginLeft: "8px" }}>
                      — {option[secondaryKey]}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required={required}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
        />
      )}
    </div>
  );
};

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAll = async () => {
    const [b, p, d, dept] = await Promise.all([
      api.get("/bookings"),
      api.get("/patients"),
      api.get("/doctors"),
      api.get("/departments"),
    ]);
    setBookings(b.data);
    setPatients(p.data);
    setDoctors(d.data);
    setDepartments(dept.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (form.doctor_id && form.date) {
      api
        .get(
          `/bookings/availability?doctor_id=${form.doctor_id}&date=${form.date}`,
        )
        .then((res) => setBookedSlots(res.data.booked_slots))
        .catch(() => setBookedSlots([]));
    }
  }, [form.doctor_id, form.date]);

  const generateSlots = () => {
    const slots = [];
    for (let h = 8; h < 17; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/bookings", form);
      setForm(emptyForm);
      setShowForm(false);
      setBookedSlots([]);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating booking");
    }
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/bookings/${id}/status`, { status });
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this booking?")) return;
    await api.delete(`/bookings/${id}`);
    fetchAll();
  };

  const filtered = bookings.filter((b) => {
    const matchSearch = `${b.patient_name} ${b.doctor_name}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [filtered.length, itemsPerPage, filterStatus, search]);

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

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    canceled: bookings.filter((b) => b.status === "canceled").length,
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
          {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} bookings
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
      <Header title="Bookings" />

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
            marginBottom: "20px",
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
              Appointments
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              {bookings.length} total bookings
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
                placeholder="Search patient or doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "36px", width: "240px" }}
              />
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setForm(emptyForm);
                setBookedSlots([]);
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
              <Plus size={15} /> New Booking
            </button>
          </div>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
          {["all", "pending", "confirmed", "canceled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: filterStatus === s ? "#0a1628" : "#fff",
                color: filterStatus === s ? "#fff" : "#64748b",
                boxShadow:
                  filterStatus === s ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
              <span style={{ opacity: 0.7 }}>({counts[s]})</span>
            </button>
          ))}
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
              New Booking
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
                    Patient
                  </label>
                  <SearchableSelect
                    options={patients}
                    value={form.patient_id}
                    onChange={(value) => setForm({ ...form, patient_id: value })}
                    placeholder="Select patient"
                    required={true}
                    displayKey="name"
                    valueKey="patient_id"
                    secondaryKey="phone"
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
                    Doctor
                  </label>
                  <SearchableSelect
                    options={doctors}
                    value={form.doctor_id}
                    onChange={(value) => setForm({ ...form, doctor_id: value, time: "" })}
                    placeholder="Select doctor"
                    required={true}
                    displayKey="name"
                    valueKey="doctor_id"
                    secondaryKey="specialization"
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
                    Date
                  </label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value, time: "" })
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
                    Appointment Type
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.appointment_type}
                    placeholder="e.g. Consultation, Follow-up"
                    onChange={(e) =>
                      setForm({ ...form, appointment_type: e.target.value })
                    }
                    required
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
                    <SearchableSelect
                      options={departments}
                      value={form.department_id}
                      onChange={(value) => setForm({ ...form, department_id: value })}
                      placeholder="Select department"
                      required={true}
                      displayKey="name"
                      valueKey="department_id"
                    />
                  </div>
                )}
              </div>

              {/* Slot picker */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "10px",
                  }}
                >
                  Time Slot
                </label>
                {!form.doctor_id || !form.date ? (
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px",
                      fontStyle: "italic",
                    }}
                  >
                    Select a doctor and date first
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(72px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {generateSlots().map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = form.time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() =>
                            !isBooked && setForm({ ...form, time: slot })
                          }
                          style={{
                            padding: "8px 4px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: isBooked ? "not-allowed" : "pointer",
                            border: isSelected
                              ? "2px solid #0a1628"
                              : "1px solid #e2e8f0",
                            background: isBooked
                              ? "#f8fafc"
                              : isSelected
                                ? "#0a1628"
                                : "#fff",
                            color: isBooked
                              ? "#cbd5e1"
                              : isSelected
                                ? "#fff"
                                : "#374151",
                            textDecoration: isBooked ? "line-through" : "none",
                            transition: "all 0.1s",
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
                <input
                  type="text"
                  value={form.time}
                  onChange={() => {}}
                  required
                  style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
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
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                    setBookedSlots([]);
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

        {/* Bookings Table */}
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
                  "Doctor",
                  "Type",
                  "Date",
                  "Time",
                  "Status",
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
              {getCurrentPageItems().map((b, i) => (
                <tr
                  key={b.booking_id}
                  style={{
                    borderTop: "1px solid #f8fafc",
                    background: i % 2 === 0 ? "#fff" : "#fafbfc",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 20px",
                      fontWeight: "600",
                      color: "#0f172a",
                    }}
                  >
                    {b.patient_name}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#64748b" }}>
                    {b.doctor_name}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#64748b" }}>
                    {b.appointment_type}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#64748b",
                      }}
                    >
                      <Calendar size={12} color="#94a3b8" />
                      {new Date(b.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#64748b",
                      }}
                    >
                      <Clock size={12} color="#94a3b8" />
                      {b.time}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleStatusChange(b.booking_id, e.target.value)
                      }
                      style={{
                        background: statusConfig[b.status]?.bg,
                        color: statusConfig[b.status]?.text,
                        border: "none",
                        borderRadius: "20px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        cursor: "pointer",
                        outline: "none",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      onClick={() => handleDelete(b.booking_id)}
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
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#cbd5e1",
                      fontSize: "13px",
                    }}
                  >
                    No bookings found
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

export default Bookings;