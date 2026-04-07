import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Users,
  CalendarDays,
  MonitorPlay,
  LogOut,
  UserCog,
  Clock,
  ChevronRight,
  FileText,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["super_admin", "supervisor", "receptionist", "marketing"],
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        to: "/departments",
        label: "Departments",
        icon: Building2,
        roles: ["super_admin"],
      },
      {
        to: "/users",
        label: "Users",
        icon: UserCog,
        roles: ["super_admin", "supervisor"],
      },
      {
        to: "/doctors",
        label: "Doctors",
        icon: Stethoscope,
        roles: ["super_admin", "supervisor"],
      },
      {
        to: "/schedules",
        label: "Schedules",
        icon: Clock,
        roles: ["super_admin", "supervisor", "receptionist"],
      },
    ],
  },
  {
    label: "Patient Services",
    items: [
      {
        to: "/patients",
        label: "Patients",
        icon: Users,
        roles: ["super_admin", "supervisor", "receptionist"],
      },
      {
        to: "/bookings",
        label: "Bookings",
        icon: CalendarDays,
        roles: ["super_admin", "supervisor", "receptionist"],
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        to: "/reports/appointments",
        label: "Appointments",
        icon: FileText,
        roles: ["super_admin", "supervisor", "receptionist"],
      },
    ],
  },
  {
    label: "Display",
    items: [
      {
        to: "/signage",
        label: "Signage",
        icon: MonitorPlay,
        roles: ["super_admin", "marketing"],
      },
    ],
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`;

  return (
    <aside
      style={{
        width: "260px",
        minHeight: "100vh",
        background: "#0a1628",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src="/logo.png"
          alt="NHL"
          style={{ width: "36px", height: "36px", objectFit: "contain" }}
        />
        <div>
          <p
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: "13px",
              margin: 0,
              letterSpacing: "0.01em",
            }}
          >
            Nakasero Hospital
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "11px",
              margin: 0,
              marginTop: "1px",
            }}
          >
            Booking System
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((i) =>
            i.roles.includes(user?.role),
          );
          if (!visibleItems.length) return null;
          return (
            <div key={group.label} style={{ marginBottom: "24px" }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "0 12px",
                  marginBottom: "6px",
                }}
              >
                {group.label}
              </p>
              {visibleItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: isActive ? "600" : "400",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                    background: isActive
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                    textDecoration: "none",
                    marginBottom: "2px",
                    borderLeft: isActive
                      ? "2px solid #c8a94a"
                      : "2px solid transparent",
                    transition: "all 0.15s ease",
                  })}
                >
                  <Icon
                    size={15}
                    strokeWidth={(isActive) => (isActive ? 2.5 : 1.5)}
                  />
                  <span style={{ flex: 1 }}>{label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.04)",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#c8a94a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700",
              color: "#0a1628",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.first_name} {user?.last_name}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "10px",
                margin: 0,
                textTransform: "capitalize",
              }}
            >
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            padding: "8px 12px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.35)",
            fontSize: "12px",
            borderRadius: "8px",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </aside>
  );
};

export default Sidebar;