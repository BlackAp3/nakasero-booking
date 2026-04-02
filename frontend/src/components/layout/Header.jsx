import { useAuth } from "../../context/AuthContext";

const Header = ({ title }) => {
  const { user } = useAuth();
  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`;

  return (
    <header
      style={{
        height: "64px",
        background: "#fff",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        flexShrink: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#0f172a",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#0f172a",
            margin: 0,
          }}
        >
          {user?.first_name} {user?.last_name}
        </p>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#0a1628",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            color: "#c8a94a",
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Header;
