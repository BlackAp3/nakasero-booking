import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import api from "../../utils/api";
import {
  Plus,
  Pencil,
  Trash2,
  Youtube,
  Megaphone,
  ExternalLink,
} from "lucide-react";

const emptyVideo = {
  department_id: "",
  title: "",
  youtube_url: "",
  is_active: true,
};
const emptyAnnouncement = { department_id: "", message: "", is_active: true };

const Signage = () => {
  const [departments, setDepartments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [videoForm, setVideoForm] = useState(emptyVideo);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("videos");

  const fetchAll = async () => {
    const [dept] = await Promise.all([api.get("/departments")]);
    setDepartments(dept.data);
    const allVideos = [];
    const allAnnouncements = [];
    for (const d of dept.data) {
      const [v, a] = await Promise.all([
        api.get(`/signage/videos/${d.department_id}`),
        api.get(`/signage/announcements/${d.department_id}`),
      ]);
      allVideos.push(...v.data.map((x) => ({ ...x, dept_name: d.name })));
      allAnnouncements.push(
        ...a.data.map((x) => ({ ...x, dept_name: d.name })),
      );
    }
    setVideos(allVideos);
    setAnnouncements(allAnnouncements);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingVideo) {
        await api.put(`/signage/videos/${editingVideo}`, videoForm);
      } else {
        await api.post("/signage/videos", videoForm);
      }
      setVideoForm(emptyVideo);
      setEditingVideo(null);
      setShowVideoForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving video");
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingAnnouncement) {
        await api.put(
          `/signage/announcements/${editingAnnouncement}`,
          announcementForm,
        );
      } else {
        await api.post("/signage/announcements", announcementForm);
      }
      setAnnouncementForm(emptyAnnouncement);
      setEditingAnnouncement(null);
      setShowAnnouncementForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving announcement");
    }
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

  const getYouTubeThumbnail = (url) => {
    try {
      const u = new URL(url);
      const id = u.searchParams.get("v") || u.pathname.split("/").pop();
      return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    } catch {
      return null;
    }
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
      <Header title="Signage Management" />

      <main
        style={{
          flex: 1,
          padding: "28px 32px",
          overflowY: "auto",
          background: "#f8fafc",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "24px",
            background: "#f1f5f9",
            padding: "4px",
            borderRadius: "10px",
            width: "fit-content",
          }}
        >
          {[
            { key: "videos", label: "Videos", icon: Youtube },
            { key: "announcements", label: "Announcements", icon: Megaphone },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                background: tab === key ? "#fff" : "transparent",
                color: tab === key ? "#0f172a" : "#64748b",
                boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* VIDEOS TAB */}
        {tab === "videos" && (
          <>
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
                  Signage Videos
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
                  {videos.length} video{videos.length !== 1 ? "s" : ""}{" "}
                  configured
                </p>
              </div>
              <button
                onClick={() => {
                  setShowVideoForm(true);
                  setEditingVideo(null);
                  setVideoForm(emptyVideo);
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
                <Plus size={15} /> Add Video
              </button>
            </div>

            {showVideoForm && (
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
                  {editingVideo ? "Edit Video" : "New Video"}
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
                <form onSubmit={handleVideoSubmit}>
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
                        Department
                      </label>
                      <select
                        style={inputStyle}
                        value={videoForm.department_id}
                        onChange={(e) =>
                          setVideoForm({
                            ...videoForm,
                            department_id: e.target.value,
                          })
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
                      <input
                        style={inputStyle}
                        type="text"
                        value={videoForm.title}
                        onChange={(e) =>
                          setVideoForm({ ...videoForm, title: e.target.value })
                        }
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        YouTube URL
                      </label>
                      <input
                        style={inputStyle}
                        type="url"
                        value={videoForm.youtube_url}
                        placeholder="https://www.youtube.com/watch?v=..."
                        onChange={(e) =>
                          setVideoForm({
                            ...videoForm,
                            youtube_url: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <input
                        type="checkbox"
                        id="video_active"
                        checked={videoForm.is_active}
                        onChange={(e) =>
                          setVideoForm({
                            ...videoForm,
                            is_active: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor="video_active"
                        style={{
                          fontSize: "13px",
                          color: "#374151",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Active
                      </label>
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
                      {editingVideo ? "Update" : "Add Video"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowVideoForm(false);
                        setEditingVideo(null);
                        setVideoForm(emptyVideo);
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

            {/* Video Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {videos.map((v) => (
                <div
                  key={v.video_id}
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    border: "1px solid #f1f5f9",
                    overflow: "hidden",
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      position: "relative",
                      height: "150px",
                      background: "#0a1628",
                      overflow: "hidden",
                    }}
                  >
                    {getYouTubeThumbnail(v.youtube_url) && (
                      <img
                        src={getYouTubeThumbnail(v.youtube_url)}
                        alt={v.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: 0.85,
                        }}
                      />
                    )}
                    <div
                      style={{ position: "absolute", top: "8px", right: "8px" }}
                    >
                      <span
                        style={{
                          background: v.is_active ? "#dcfce7" : "#f3f4f6",
                          color: v.is_active ? "#166534" : "#6b7280",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "20px",
                        }}
                      >
                        {v.is_active ? "Live" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <p
                      style={{
                        fontWeight: "700",
                        color: "#0f172a",
                        fontSize: "13px",
                        margin: "0 0 4px 0",
                      }}
                    >
                      {v.title || "Untitled"}
                    </p>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "11px",
                        margin: "0 0 12px 0",
                      }}
                    >
                      {v.dept_name}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <a
                        href={v.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#3b82f6",
                          fontSize: "11px",
                          fontWeight: "600",
                          textDecoration: "none",
                        }}
                      >
                        <ExternalLink size={11} /> View
                      </a>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => {
                            setVideoForm({
                              department_id: v.department_id,
                              title: v.title,
                              youtube_url: v.youtube_url,
                              is_active: v.is_active,
                            });
                            setEditingVideo(v.video_id);
                            setShowVideoForm(true);
                          }}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "7px",
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Pencil size={12} color="#64748b" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Delete?")) return;
                            await api.delete(`/signage/videos/${v.video_id}`);
                            fetchAll();
                          }}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "7px",
                            border: "1px solid #fee2e2",
                            background: "#fef2f2",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 size={12} color="#dc2626" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "60px",
                    textAlign: "center",
                    color: "#cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  No videos added yet
                </div>
              )}
            </div>
          </>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {tab === "announcements" && (
          <>
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
                  Announcements
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
                  {announcements.length} announcement
                  {announcements.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAnnouncementForm(true);
                  setEditingAnnouncement(null);
                  setAnnouncementForm(emptyAnnouncement);
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
                <Plus size={15} /> Add Announcement
              </button>
            </div>

            {showAnnouncementForm && (
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
                  {editingAnnouncement
                    ? "Edit Announcement"
                    : "New Announcement"}
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
                <form onSubmit={handleAnnouncementSubmit}>
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
                        Department
                      </label>
                      <select
                        style={inputStyle}
                        value={announcementForm.department_id}
                        onChange={(e) =>
                          setAnnouncementForm({
                            ...announcementForm,
                            department_id: e.target.value,
                          })
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        paddingTop: "24px",
                      }}
                    >
                      <input
                        type="checkbox"
                        id="ann_active"
                        checked={announcementForm.is_active}
                        onChange={(e) =>
                          setAnnouncementForm({
                            ...announcementForm,
                            is_active: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor="ann_active"
                        style={{
                          fontSize: "13px",
                          color: "#374151",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Active
                      </label>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        Message
                      </label>
                      <textarea
                        style={{
                          ...inputStyle,
                          minHeight: "80px",
                          resize: "vertical",
                        }}
                        value={announcementForm.message}
                        onChange={(e) =>
                          setAnnouncementForm({
                            ...announcementForm,
                            message: e.target.value,
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
                      {editingAnnouncement ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAnnouncementForm(false);
                        setEditingAnnouncement(null);
                        setAnnouncementForm(emptyAnnouncement);
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

            {/* Announcement Cards */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {announcements.map((a) => (
                <div
                  key={a.announcement_id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #f1f5f9",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: a.is_active ? "#fef9c3" : "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Megaphone
                      size={16}
                      color={a.is_active ? "#854d0e" : "#9ca3af"}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#3b82f6",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {a.dept_name}
                      </span>
                      <span
                        style={{
                          background: a.is_active ? "#dcfce7" : "#f3f4f6",
                          color: a.is_active ? "#166534" : "#6b7280",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "#374151",
                        fontSize: "13px",
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      {a.message}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setAnnouncementForm({
                          department_id: a.department_id,
                          message: a.message,
                          is_active: a.is_active,
                        });
                        setEditingAnnouncement(a.announcement_id);
                        setShowAnnouncementForm(true);
                      }}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Pencil size={12} color="#64748b" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete?")) return;
                        await api.delete(
                          `/signage/announcements/${a.announcement_id}`,
                        );
                        fetchAll();
                      }}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        border: "1px solid #fee2e2",
                        background: "#fef2f2",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={12} color="#dc2626" />
                    </button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div
                  style={{
                    padding: "60px",
                    textAlign: "center",
                    color: "#cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  No announcements yet
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        input:focus, select:focus, textarea:focus { border-color: #0a1628 !important; box-shadow: 0 0 0 3px rgba(10,22,40,0.08); }
      `}</style>
    </div>
  );
};

export default Signage;
