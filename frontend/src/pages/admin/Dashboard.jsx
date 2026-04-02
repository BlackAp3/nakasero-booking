import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    bookings: 0,
    departments: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, doctors, bookingsRes, departments] = await Promise.all(
          [
            api.get("/patients"),
            api.get("/doctors"),
            api.get("/bookings"),
            api.get("/departments"),
          ],
        );
        setStats({
          patients: patients.data.length,
          doctors: doctors.data.length,
          bookings: bookingsRes.data.length,
          departments: departments.data.length,
        });
        setBookings(bookingsRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusColors = {
    pending: { bg: "#fef9c3", text: "#854d0e" },
    confirmed: { bg: "#dcfce7", text: "#166534" },
    canceled: { bg: "#fee2e2", text: "#991b1b" },
  };

  const statCards = [
    {
      label: "Total Patients",
      value: stats.patients,
      color: "#3b82f6",
      sub: "Registered",
    },
    {
      label: "Total Doctors",
      value: stats.doctors,
      color: "#10b981",
      sub: "Active",
    },
    {
      label: "Bookings",
      value: stats.bookings,
      color: "#8b5cf6",
      sub: "All time",
    },
    {
      label: "Departments",
      value: stats.departments,
      color: "#c8a94a",
      sub: "Active",
    },
  ];

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
      <Header title="Dashboard" />

      <main
        style={{
          flex: 1,
          padding: "28px 32px",
          overflowY: "auto",
          background: "#f8fafc",
        }}
      >
        {/* Welcome */}
        <div style={{ marginBottom: "28px" }}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#0f172a",
              margin: "0 0 4px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Good day, {user?.first_name} 👋
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
            {user?.department_id
              ? `Department overview`
              : "System-wide overview — all departments"}
          </p>
        </div>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {statCards.map(({ label, value, color, sub }) => (
            <div
              key={label}
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "20px 24px",
                border: "1px solid #f1f5f9",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "4px",
                  height: "100%",
                  background: color,
                  borderRadius: "14px 0 0 14px",
                }}
              />
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 10px 0",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: "0 0 4px 0",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {loading ? "—" : value}
              </p>
              <p style={{ color: "#cbd5e1", fontSize: "11px", margin: 0 }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Bookings */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #f1f5f9",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid #f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Recent Bookings
            </h3>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Last 5</span>
          </div>

          {bookings.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#cbd5e1",
                fontSize: "13px",
              }}
            >
              No bookings yet
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Patient", "Doctor", "Type", "Date", "Time", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 20px",
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
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr
                    key={b.booking_id}
                    style={{
                      borderTop: "1px solid #f8fafc",
                      background: i % 2 === 0 ? "#fff" : "#fafbfc",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 20px",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      {b.patient_name}
                    </td>
                    <td style={{ padding: "12px 20px", color: "#64748b" }}>
                      {b.doctor_name}
                    </td>
                    <td style={{ padding: "12px 20px", color: "#64748b" }}>
                      {b.appointment_type}
                    </td>
                    <td style={{ padding: "12px 20px", color: "#64748b" }}>
                      {new Date(b.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "12px 20px", color: "#64748b" }}>
                      {b.time}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span
                        style={{
                          background: statusColors[b.status]?.bg || "#f3f4f6",
                          color: statusColors[b.status]?.text || "#374151",
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          textTransform: "capitalize",
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

export default Dashboard;
