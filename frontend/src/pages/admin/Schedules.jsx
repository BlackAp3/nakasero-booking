import { useEffect, useState, useRef } from "react";
import Header from "../../components/layout/Header";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Plus, Pencil, Trash2, Search, ChevronDown, X } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const dayColors = {
  Monday: "#dbeafe",
  Tuesday: "#ede9fe",
  Wednesday: "#dcfce7",
  Thursday: "#fef9c3",
  Friday: "#fee2e2",
  Saturday: "#fce7f3",
  Sunday: "#f3f4f6",
};

const dayTextColors = {
  Monday: "#1e40af",
  Tuesday: "#6d28d9",
  Wednesday: "#166534",
  Thursday: "#854d0e",
  Friday: "#991b1b",
  Saturday: "#9d174d",
  Sunday: "#374151",
};

const emptyForm = {
  doctor_id: "",
  day_of_week: "",
  start_time: "",
  end_time: "",
};

// Reusable Searchable Select Component
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  required,
  displayKey = "name",
  valueKey = "id",
  secondaryKey = null,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt[valueKey] == value);

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

  const filteredOptions = options.filter((opt) => {
    const searchLower = searchTerm.toLowerCase();
    const primaryMatch = opt[displayKey]?.toLowerCase().includes(searchLower);
    const secondaryMatch = secondaryKey
      ? opt[secondaryKey]?.toLowerCase().includes(searchLower)
      : false;
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
          minHeight: "41px",
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
            <X size={14} color="#94a3b8" style={{ cursor: "pointer" }} onClick={handleClear} />
          )}
          <ChevronDown
            size={14}
            color="#94a3b8"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", zIndex: 1000, maxHeight: "300px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "8px 8px 8px 32px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          <div style={{ overflowY: "auto", maxHeight: "250px" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  style={{ padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: value == option[valueKey] ? "#0a1628" : "#0f172a", background: value == option[valueKey] ? "#f8fafc" : "transparent", fontWeight: value == option[valueKey] ? "600" : "400", borderBottom: "1px solid #f8fafc", transition: "background 0.15s" }}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={(e) => { if (value != option[valueKey]) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (value != option[valueKey]) e.currentTarget.style.background = "transparent"; }}
                >
                  {option[displayKey]}
                  {secondaryKey && option[secondaryKey] && (
                    <span style={{ color: "#94a3b8", fontSize: "11px", marginLeft: "8px" }}>— {option[secondaryKey]}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {required && (
        <input type="text" value={value} onChange={() => {}} required={required}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }} />
      )}
    </div>
  );
};

const Schedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [filterDay, setFilterDay] = useState("all");

  const fetchAll = async () => {
    const [s, d] = await Promise.all([
      api.get("/schedules"),
      api.get("/doctors"),
    ]);
    setSchedules(s.data);
    setDoctors(d.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`/schedules/${editing}`, { ...form, is_active: true });
      } else {
        await api.post("/schedules", form);
      }
      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving schedule");
    }
  };

  const handleEdit = (s) => {
    setForm({
      doctor_id: s.doctor_id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
    });
    setEditing(s.schedule_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this schedule?")) return;
    await api.delete(`/schedules/${id}`);
    fetchAll();
  };

  const toggleActive = async (s) => {
    await api.put(`/schedules/${s.schedule_id}`, {
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      is_active: !s.is_active,
    });
    fetchAll();
  };

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const filtered =
    filterDay === "all"
      ? schedules
      : schedules.filter((s) => s.day_of_week === filterDay);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Header title="Doctor Schedules" />

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", background: "#f8fafc" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 2px 0" }}>Doctor Schedules</h2>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} configured
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0a1628", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
          >
            <Plus size={15} /> Add Schedule
          </button>
        </div>

        {/* Day filter */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterDay("all")}
            style={{ padding: "6px 14px", borderRadius: "20px", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer", background: filterDay === "all" ? "#0a1628" : "#fff", color: filterDay === "all" ? "#fff" : "#64748b", boxShadow: filterDay === "all" ? "none" : "0 1px 2px rgba(0,0,0,0.05)" }}
          >
            All Days
          </button>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              style={{ padding: "6px 14px", borderRadius: "20px", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer", background: filterDay === day ? dayColors[day] : "#fff", color: filterDay === day ? dayTextColors[day] : "#64748b", boxShadow: filterDay === day ? "none" : "0 1px 2px rgba(0,0,0,0.05)" }}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 20px 0" }}>
              {editing ? "Edit Schedule" : "New Schedule"}
            </h3>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", color: "#dc2626", fontSize: "12px", marginBottom: "16px" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Doctor</label>
                  <SearchableSelect
                    options={doctors}
                    value={form.doctor_id}
                    onChange={(value) => setForm({ ...form, doctor_id: value })}
                    placeholder="Search doctor..."
                    required={true}
                    displayKey="name"
                    valueKey="doctor_id"
                    secondaryKey="specialization"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Day</label>
                  <select
                    style={inputStyle}
                    value={form.day_of_week}
                    onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                    required
                  >
                    <option value="">Select day</option>
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Start Time</label>
                  <input
                    style={inputStyle}
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>End Time</label>
                  <input
                    style={inputStyle}
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ background: "#0a1628", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  {editing ? "Update" : "Create"}
                </button>
                <button type="button"
                  onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
                  style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Schedule Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {filtered.map((s) => (
            <div key={s.schedule_id} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #f1f5f9", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#c8a94a", fontSize: "12px", fontWeight: "700" }}>{s.doctor_name?.[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px", margin: "0 0 1px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.doctor_name}</p>
                  <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>{s.specialization}</p>
                </div>
                <span style={{ background: dayColors[s.day_of_week] || "#f3f4f6", color: dayTextColors[s.day_of_week] || "#374151", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", flexShrink: 0 }}>
                  {s.day_of_week?.slice(0, 3)}
                </span>
              </div>

              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ color: "#94a3b8", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", margin: "0 0 2px 0" }}>Hours</p>
                  <p style={{ color: "#0f172a", fontSize: "13px", fontWeight: "700", margin: 0 }}>
                    {formatTime(s.start_time)} — {formatTime(s.end_time)}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(s)}
                  style={{ padding: "4px 10px", borderRadius: "20px", border: "none", fontSize: "11px", fontWeight: "600", cursor: "pointer", background: s.is_active ? "#dcfce7" : "#f3f4f6", color: s.is_active ? "#166534" : "#6b7280" }}
                >
                  {s.is_active ? "Active" : "Inactive"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                <button onClick={() => handleEdit(s)} style={{ width: "30px", height: "30px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Pencil size={13} color="#64748b" />
                </button>
                <button onClick={() => handleDelete(s.schedule_id)} style={{ width: "30px", height: "30px", borderRadius: "7px", border: "1px solid #fee2e2", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={13} color="#dc2626" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: "60px", textAlign: "center", color: "#cbd5e1", fontSize: "13px" }}>
              No schedules found
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        input:focus, select:focus { border-color: #0a1628 !important; box-shadow: 0 0 0 3px rgba(10,22,40,0.08); }
      `}</style>
    </div>
  );
};

export default Schedules;