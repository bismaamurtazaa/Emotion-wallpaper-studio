import { useState } from "react";

export default function WallpaperCard({ wallpaper, onDownload, onDelete, index }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ animation: `fadeUp 0.5s ease forwards`, animationDelay: `${index * 0.1}s`, opacity: 0 }} className="relative group">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff", borderRadius: "24px", border: "2px solid #eef0fa",
          overflow: "hidden",
          boxShadow: hovered ? "0 24px 48px rgba(124,58,237,0.18), 0 8px 16px rgba(0,0,0,0.08)" : "0 4px 20px rgba(0,0,0,0.07)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {!loaded && !errored && (
          <div style={{ background: "linear-gradient(135deg, #f5f3ff, #fdf2f8, #f0f9ff)", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative", width: 52, height: 52 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #ede9fe" }}/>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#7c3aed", animation: "spin 0.8s linear infinite" }}/>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: 4 }}>Crafting your wallpaper…</p>
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>Usually 15–30 seconds</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: wallpaper.emotionColor + "18", color: wallpaper.emotionColor }}>
                {wallpaper.emotion}
              </span>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, background: "#f1f5f9", color: "#64748b" }}>
                {wallpaper.style}
              </span>
            </div>
          </div>
        )}

        {errored && (
          <div style={{ background: "#fff5f5", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "3rem" }}>🖼️</span>
            <p style={{ fontSize: "13px", color: "#f87171", fontWeight: 500 }}>Image failed to load</p>
            <button onClick={() => { setErrored(false); setLoaded(false); }}
              style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600, textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
              Try again ↺
            </button>
          </div>
        )}

        <img
          src={wallpaper.imageUrl}
          alt={wallpaper.prompt}
          style={{
  width: "100%", height: "auto", display: errored ? "none" : "block",
            display: errored ? "none" : "block",
            opacity: loaded ? 1 : 0,
            transform: hovered && loaded ? "scale(1.04)" : "scale(1)",
            transition: "opacity 0.7s ease, transform 0.5s ease",
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />

        {hovered && loaded && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "260px",
            background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 50%)",
            display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "14px",
          }}>
            <button onClick={() => onDownload(wallpaper)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "50px",
                background: "rgba(255,255,255,0.22)", backdropFilter: "blur(10px)",
                border: "1.5px solid rgba(255,255,255,0.45)",
                color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              }}>
              ⬇ Download
            </button>
          </div>
        )}

        <div style={{ padding: "16px 18px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: wallpaper.emotionColor + "18", color: wallpaper.emotionColor, border: `1px solid ${wallpaper.emotionColor}25` }}>
                {wallpaper.emotion}
              </span>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, background: "#f1f5f9", color: "#64748b" }}>
                {wallpaper.style}
              </span>
              <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 500, background: "#f8f7ff", color: "#8b5cf6" }}>
                {wallpaper.intensity}%
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "#cbd5e1" }}>{wallpaper.createdAt}</span>
          </div>
          <p style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.6, fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            "{wallpaper.prompt}"
          </p>
        </div>
      </div>

      <button onClick={() => onDelete(wallpaper.id)}
        style={{
          position: "absolute", top: "-8px", right: "-8px",
          width: "28px", height: "28px", borderRadius: "50%",
          background: "#ef4444", color: "#fff", border: "2px solid #fff",
          fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", opacity: 0, transition: "all 0.2s ease",
          boxShadow: "0 4px 12px rgba(239,68,68,0.4)", zIndex: 10,
        }}
        className="group-hover:opacity-100"
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = "scale(1.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >×</button>
    </div>
  );
}