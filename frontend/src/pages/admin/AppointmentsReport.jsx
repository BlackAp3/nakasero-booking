import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { 
  Search, 
  Calendar, 
  Printer, 
  Download, 
  Filter,
  X,
  CheckCircle,
  Clock3,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const statusConfig = {
  pending: { bg: "#fef9c3", text: "#854d0e", icon: Clock3, label: "Pending" },
  confirmed: { bg: "#dcfce7", text: "#166534", icon: CheckCircle, label: "Confirmed" },
  canceled: { bg: "#fee2e2", text: "#991b1b", icon: XCircle, label: "Canceled" },
};

const AppointmentsReport = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  
  // Quick date filters
  const quickDates = [
    { label: "Today", days: 0 },
    { label: "Tomorrow", days: 1 },
    { label: "This Week", days: 7 },
    { label: "This Month", days: 30 },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [dateRange, selectedDoctor, selectedDepartment, selectedStatus, searchTerm]);

  const fetchData = async () => {
    try {
      const [doctorsRes, deptsRes] = await Promise.all([
        api.get("/doctors"),
        api.get("/departments")
      ]);
      setDoctors(doctorsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (dateRange.start) params.append("start_date", dateRange.start);
      if (dateRange.end) params.append("end_date", dateRange.end);
      if (selectedDoctor !== "all") params.append("doctor_id", selectedDoctor);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (searchTerm) params.append("search", searchTerm);
      
      const response = await api.get(`/bookings/report?${params.toString()}`);
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDate = (days) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDoctor("all");
    setSelectedDepartment("all");
    setSelectedStatus("all");
    setDateRange({
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const searchLower = searchTerm.toLowerCase();
    return (
      apt.patient_name?.toLowerCase().includes(searchLower) ||
      apt.doctor_name?.toLowerCase().includes(searchLower) ||
      apt.appointment_type?.toLowerCase().includes(searchLower)
    );
  });

  // Sort appointments by date and time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(sortedAppointments.length / itemsPerPage));
    setCurrentPage(1);
  }, [sortedAppointments.length, itemsPerPage]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAppointments.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Statistics
  const stats = {
    total: sortedAppointments.length,
    confirmed: sortedAppointments.filter(a => a.status === "confirmed").length,
    pending: sortedAppointments.filter(a => a.status === "pending").length,
    canceled: sortedAppointments.filter(a => a.status === "canceled").length,
    uniquePatients: [...new Set(sortedAppointments.map(a => a.patient_name))].length,
  };

  // Print functionality - Clean Doctor Report
  const handlePrint = () => {
    const logoImg = document.querySelector('img[alt="NHL"]')?.src || '/logo.png';
    const now = new Date();
    const reportDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    const doctorName = selectedDoctor === 'all' 
      ? 'All Doctors' 
      : doctors.find(d => d.doctor_id == selectedDoctor)?.name || 'All Doctors';
    
    const isSingleDoctor = selectedDoctor !== 'all';
    
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doctorName} - Appointments</title>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background: white;
              padding: 40px;
              color: #0f172a;
            }
            
            .container { max-width: 1200px; margin: 0 auto; }
            
            /* Header */
            .header {
              display: flex;
              align-items: center;
              gap: 20px;
              margin-bottom: 24px;
              padding-bottom: 20px;
              border-bottom: 2px solid #0a1628;
            }
            
            .logo {
              width: 60px;
              height: 60px;
              object-fit: contain;
            }
            
            .hospital-info h1 {
              font-size: 24px;
              font-weight: 700;
              color: #0a1628;
              margin-bottom: 4px;
            }
            
            .hospital-info .tagline {
              font-size: 12px;
              color: #c8a94a;
              font-weight: 600;
              letter-spacing: 0.05em;
            }
            
            /* Doctor Section */
            .doctor-section {
              margin-bottom: 30px;
            }
            
            .doctor-name {
              font-size: 28px;
              font-weight: 700;
              color: #0a1628;
              margin-bottom: 8px;
            }
            
            .doctor-meta {
              display: flex;
              gap: 30px;
              font-size: 13px;
              color: #64748b;
            }
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .meta-label {
              font-weight: 600;
              color: #94a3b8;
            }
            
            .meta-value {
              font-weight: 500;
              color: #0f172a;
            }
            
            /* Table */
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            
            thead tr {
              background: #0a1628;
            }
            
            th {
              padding: 14px 16px;
              text-align: left;
              color: white;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            
            td {
              padding: 14px 16px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
            }
            
            tbody tr:hover {
              background: #f8fafc;
            }
            
            .status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
            }
            
            .status.confirmed {
              background: #dcfce7;
              color: #166534;
            }
            
            .status.pending {
              background: #fef9c3;
              color: #854d0e;
            }
            
            .status.canceled {
              background: #fee2e2;
              color: #991b1b;
            }
            
            /* Footer */
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #94a3b8;
            }
            
            .total-count {
              margin-top: 10px;
              font-size: 12px;
              color: #64748b;
              font-weight: 500;
            }
            
            @media print {
              body { padding: 20px; }
              .status.confirmed { background: #dcfce7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .status.pending { background: #fef9c3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .status.canceled { background: #fee2e2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              thead tr { background: #0a1628 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <img src="${logoImg}" alt="NHL" class="logo" onerror="this.style.display='none'">
              <div class="hospital-info">
                <h1>Nakasero Hospital</h1>
                <div class="tagline">QUALITY • COMPASSION • CARE</div>
              </div>
            </div>
            
            <!-- Doctor Info -->
            <div class="doctor-section">
              <div class="doctor-name">${doctorName}</div>
              <div class="doctor-meta">
                <div class="meta-item">
                  <span class="meta-label">Period:</span>
                  <span class="meta-value">${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Generated:</span>
                  <span class="meta-value">${reportDate}</span>
                </div>
              </div>
            </div>
            
            <!-- Appointments Table -->
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${sortedAppointments.map(apt => `
                  <tr>
                    <td><strong>${formatDate(apt.date)}</strong></td>
                    <td>${apt.time}</td>
                    <td>${apt.patient_name}</td>
                    <td>${apt.patient_phone || '—'}</td>
                    <td>${apt.appointment_type}</td>
                    <td><span class="status ${apt.status}">${apt.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-count">
              Total Appointments: ${stats.total} | Confirmed: ${stats.confirmed} | Pending: ${stats.pending} | Canceled: ${stats.canceled}
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div>CONFIDENTIAL - For authorized medical personnel only</div>
              <div>Nakasero Hospital • Plot 14A, Nakasero Road, Kampala</div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 100);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['Date', 'Time', 'Patient', 'Phone', 'Doctor', 'Type', 'Status'];
    const rows = sortedAppointments.map(apt => [
      formatDate(apt.date),
      apt.time,
      apt.patient_name,
      apt.patient_phone || '',
      apt.doctor_name,
      apt.appointment_type,
      apt.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Doctor_Appointments_${dateRange.start}_to_${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    background: "#fff",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
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

    if (totalPages <= 1) return null;

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
          Showing {sortedAppointments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, sortedAppointments.length)} of {sortedAppointments.length} appointments
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
      <Header title="Appointments Report" />

      <main
        style={{
          flex: 1,
          padding: "28px 32px",
          overflowY: "auto",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 2px 0" }}>
              Appointments Report
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              View, filter, and analyze appointment data
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              <Download size={14} /> Export CSV
            </button>
            <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0a1628", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              <Printer size={14} /> Print Report
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", cursor: "pointer" }} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} color="#64748b" />
            <span style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>Filters</span>
            <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "4px" }}>{showFilters ? "▼" : "▶"}</span>
          </div>

          {showFilters && (
            <>
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                {quickDates.map((qd) => (
                  <button key={qd.label} onClick={() => handleQuickDate(qd.days)} style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "12px", fontWeight: "500", color: "#64748b", cursor: "pointer" }}>
                    {qd.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", alignItems: "end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Start Date</label>
                  <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>End Date</label>
                  <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Doctor</label>
                  <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} style={inputStyle}>
                    <option value="all">All Doctors</option>
                    {doctors.map((doc) => (
                      <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Status</label>
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={inputStyle}>
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={clearFilters} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "500", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", flex: 1, justifyContent: "center" }}>
                    <X size={14} /> Clear
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
            <Search size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input type="text" placeholder="Search by patient, doctor, or appointment type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: "42px" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#0a1628" }}>{stats.total}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Total Appointments</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#166534" }}>{stats.confirmed}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Confirmed</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#854d0e" }}>{stats.pending}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Pending</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#0a1628" }}>{stats.uniquePatients}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Total Patients</div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #f1f5f9", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>Loading appointments...</div>
          ) : sortedAppointments.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#cbd5e1", fontSize: "13px" }}>No appointments found</div>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>Date</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>Time</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>Patient</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>Doctor</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>Type</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((apt, idx) => {
                    const StatusIcon = statusConfig[apt.status]?.icon || CheckCircle;
                    return (
                      <tr key={apt.booking_id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                        <td style={{ padding: "14px 20px", color: "#0f172a", fontWeight: "500" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Calendar size={12} color="#94a3b8" />
                            {formatDate(apt.date)}
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", color: "#0f172a", fontWeight: "500" }}>{apt.time}</td>
                        <td style={{ padding: "14px 20px", color: "#0f172a", fontWeight: "500" }}>{apt.patient_name}</td>
                        <td style={{ padding: "14px 20px", color: "#64748b" }}>{apt.doctor_name}</td>
                        <td style={{ padding: "14px 20px", color: "#64748b" }}>{apt.appointment_type}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ background: statusConfig[apt.status]?.bg || "#f3f4f6", color: statusConfig[apt.status]?.text || "#374151", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <StatusIcon size={11} />
                            {statusConfig[apt.status]?.label || apt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination />
            </>
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

export default AppointmentsReport;