import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const DOCTORS_PER_PAGE = 4;

const getYouTubeEmbedUrl = (url) => {
  try {
    const u = new URL(url);
    let id = u.searchParams.get("v");
    if (!id) id = u.pathname.split("/").pop();
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0`;
  } catch {
    return null;
  }
};

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const Display = () => {
  const { department_id } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [videos, setVideos] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ticker, setTicker] = useState("");

  const fetchData = async () => {
    try {
      const [s, v, a] = await Promise.all([
        fetch(`/api/schedules/today/${department_id}`).then((r) => r.json()),
        fetch(`/api/signage/videos/${department_id}`).then((r) => r.json()),
        fetch(`/api/signage/announcements/${department_id}`).then((r) =>
          r.json(),
        ),
      ]);
      setSchedules(Array.isArray(s) ? s : []);
      setVideos(Array.isArray(v) ? v : []);
      setAnnouncements(Array.isArray(a) ? a : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [department_id]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const totalPages = Math.ceil(schedules.length / DOCTORS_PER_PAGE);
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(
      () => setCurrentPage((p) => (p + 1) % totalPages),
      8000,
    );
    return () => clearInterval(interval);
  }, [totalPages]);

  useEffect(() => {
    if (announcements.length > 0) {
      setTicker(announcements.map((a) => a.message).join("   •   "));
    }
  }, [announcements]);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatClock = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const currentDoctors = schedules.slice(
    currentPage * DOCTORS_PER_PAGE,
    (currentPage + 1) * DOCTORS_PER_PAGE,
  );

  const activeVideo = videos[0];

  return (
    <div
      style={{
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        background: "#eef2f7",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 36px",
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          flexShrink: 0,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {/* Left — Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img
            src="/logo.png"
            alt="NHL"
            style={{ width: "48px", height: "48px", objectFit: "contain" }}
          />
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#0a1628",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Doctor Schedule
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>
              Nakasero Hospital Limited
            </p>
          </div>
        </div>

        {/* Center — Date & Time */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: "#c8a94a",
              fontWeight: "700",
              fontSize: "15px",
              margin: 0,
            }}
          >
            {formatDate(currentTime)}
          </p>
          <p
            style={{
              color: "#64748b",
              fontSize: "13px",
              margin: "2px 0 0 0",
              fontWeight: "600",
            }}
          >
            {formatClock(currentTime)}
          </p>
        </div>

        {/* Right — Doctor count */}
        <div
          style={{
            background: "#f0f4f8",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "8px 20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#94a3b8",
              fontSize: "10px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 2px 0",
            }}
          >
            On Duty Today
          </p>
          <p
            style={{
              color: "#0a1628",
              fontSize: "22px",
              fontWeight: "800",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {schedules.length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          padding: "14px 36px",
          gap: "16px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Doctor Cards — 52% */}
        <div
          style={{
            width: "52%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflow: "hidden",
          }}
        >
          {currentDoctors.map((doc) => (
            <div
              key={doc.schedule_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #e8edf3",
                borderLeft: "4px solid #0a1628",
                padding: "14px 20px",
                flex: 1,
                minHeight: 0,
                maxHeight: "160px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              {/* Photo */}
              <div
                style={{
                  width: "68px",
                  height: "68px",
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
                    alt={doc.doctor_name}
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
                      fontSize: "20px",
                      fontWeight: "800",
                    }}
                  >
                    {doc.doctor_name?.[0]}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    color: "#0a1628",
                    fontWeight: "800",
                    fontSize: "16px",
                    margin: "0 0 8px 0",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {doc.doctor_name}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.3fr 0.7fr",
                    gap: "12px",
                  }}
                >
                  {[
                    {
                      label: "Specialty",
                      value: doc.specialization,
                      color: "#334155",
                    },
                    {
                      label: "Availability",
                      value: `${formatTime(doc.start_time)} – ${formatTime(doc.end_time)}`,
                      color: "#16a34a",
                    },
                    { label: "Room", value: doc.room || "—", color: "#0a1628" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "9px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          margin: "0 0 3px 0",
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          color,
                          fontSize: "13px",
                          fontWeight: "700",
                          margin: 0,
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {schedules.length === 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#cbd5e1",
                fontSize: "15px",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <img
                src="/logo.png"
                alt="NHL"
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "contain",
                  opacity: 0.2,
                }}
              />
              <p style={{ margin: 0 }}>No doctors scheduled for today</p>
            </div>
          )}

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "6px",
                paddingTop: "4px",
              }}
            >
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  style={{
                    width: i === currentPage ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    background: i === currentPage ? "#0a1628" : "#cbd5e1",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Video Panel — 48% */}
        {activeVideo ? (
          <div
            style={{
              width: "calc(48% - 16px)",
              flexShrink: 0,
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              background: "#000",
              position: "relative",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <iframe
              src={getYouTubeEmbedUrl(activeVideo.youtube_url)}
              style={{
                position: "absolute",
                top: "-18%",
                left: 0,
                width: "100%",
                height: "136%",
                border: "none",
              }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={activeVideo.title}
            />
          </div>
        ) : (
          <div
            style={{
              width: "calc(48% - 16px)",
              flexShrink: 0,
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <img
              src="/logo.png"
              alt="NHL"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "contain",
                opacity: 0.15,
              }}
            />
            <p style={{ color: "#cbd5e1", fontSize: "13px", margin: 0 }}>
              No video configured
            </p>
          </div>
        )}
      </div>

      {/* Ticker */}
      {ticker && (
        <div
          style={{
            background: "#0a1628",
            padding: "0",
            overflow: "hidden",
            display: "flex",
            alignItems: "stretch",
            flexShrink: 0,
            height: "42px",
          }}
        >
          <div
            style={{
              background: "#c8a94a",
              color: "#0a1628",
              fontWeight: "800",
              padding: "0 24px",
              flexShrink: 0,
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Updates
          </div>
          <div
            style={{
              overflow: "hidden",
              flex: 1,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
            }}
          >
            <p
              style={{
                whiteSpace: "nowrap",
                fontSize: "13px",
                margin: 0,
                color: "rgba(255,255,255,0.75)",
                fontWeight: "500",
                animation: "marquee 35s linear infinite",
              }}
            >
              {ticker}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; background: #eef2f7; }
        * { box-sizing: border-box; }
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default Display;
