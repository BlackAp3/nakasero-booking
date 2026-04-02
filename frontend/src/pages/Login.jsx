import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Left Panel */}
      <div
        style={{
          flex: "0 0 45%",
          background: "#0a1628",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(200,169,74,0.08) 0%, transparent 60%),
                            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 40%)`,
          }}
        />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img
              src="/logo.png"
              alt="NHL"
              style={{ width: "52px", height: "52px", objectFit: "contain" }}
            />
            <div>
              <p
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: "16px",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Nakasero Hospital
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                Quality Care With Compassion
              </p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: "48px",
              height: "4px",
              background: "#c8a94a",
              borderRadius: "2px",
              marginBottom: "24px",
            }}
          />
          <h1
            style={{
              color: "#fff",
              fontSize: "36px",
              fontWeight: "800",
              lineHeight: "1.2",
              margin: "0 0 16px 0",
              letterSpacing: "-0.03em",
            }}
          >
            Patient Booking
            <br />
            <span style={{ color: "#c8a94a" }}>Management</span>
            <br />
            System
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "14px",
              lineHeight: "1.7",
              margin: 0,
              maxWidth: "320px",
            }}
          >
            Streamlined appointment scheduling, doctor schedule management, and
            digital signage — all in one platform.
          </p>
        </div>

        {/* Bottom */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              { value: "Secure", label: "Role-based access" },
              { value: "Real-time", label: "Live TV signage" },
              { value: "Multi-dept", label: "Data isolation" },
            ].map(({ value, label }) => (
              <div key={value}>
                <p
                  style={{
                    color: "#c8a94a",
                    fontWeight: "700",
                    fontSize: "13px",
                    margin: "0 0 2px 0",
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "11px",
                    margin: 0,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          padding: "48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ marginBottom: "36px" }}>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#0f172a",
                margin: "0 0 8px 0",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome back
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                padding: "12px 16px",
                color: "#dc2626",
                fontSize: "13px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#dc2626",
                  flexShrink: 0,
                }}
              />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                  letterSpacing: "0.02em",
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter your username"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0a1628")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                  letterSpacing: "0.02em",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 16px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#fff",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0a1628")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                background: loading ? "#94a3b8" : "#0a1628",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.01em",
                transition: "background 0.15s",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              color: "#cbd5e1",
              fontSize: "12px",
              marginTop: "32px",
            }}
          >
            Nakasero Hospital Limited © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

export default Login;
