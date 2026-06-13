export const EMOTIONS = [
  { label: "Joy",        emoji: "✨", color: "#f59e0b", bg: "#fffbeb" },
  { label: "Melancholy", emoji: "🌧",  color: "#6b8ccc", bg: "#eff6ff" },
  { label: "Rage",       emoji: "🔥", color: "#ef4444", bg: "#fff1f2" },
  { label: "Serenity",   emoji: "🌿", color: "#10b981", bg: "#f0fdf4" },
  { label: "Fear",       emoji: "🕷",  color: "#8b5cf6", bg: "#faf5ff" },
  { label: "Love",       emoji: "🌸", color: "#ec4899", bg: "#fdf2f8" },
  { label: "Wonder",     emoji: "🌌", color: "#0ea5e9", bg: "#f0f9ff" },
  { label: "Nostalgia",  emoji: "🍂", color: "#d97706", bg: "#fffbeb" },
  { label: "Euphoria",   emoji: "⚡", color: "#eab308", bg: "#fefce8" },
  { label: "Solitude",   emoji: "🌙", color: "#64748b", bg: "#f8fafc" },
  { label: "Hope",       emoji: "🌅", color: "#f97316", bg: "#fff7ed" },
  { label: "Chaos",      emoji: "🌀", color: "#a855f7", bg: "#faf5ff" },
];

export default function EmotionGrid({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {EMOTIONS.map((em) => {
        const isSelected = selected?.label === em.label;
        return (
          <button
            key={em.label}
            onClick={() => onSelect(isSelected ? null : em)}
            style={{
              background: isSelected ? `linear-gradient(135deg, ${em.bg}, white)` : "#fafbff",
              border: isSelected ? `2px solid ${em.color}` : "2px solid #eef0fa",
              borderRadius: "18px",
              padding: "14px 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: isSelected ? "translateY(-4px) scale(1.05)" : "translateY(0) scale(1)",
              boxShadow: isSelected
                ? `0 8px 24px ${em.color}35, 0 2px 8px ${em.color}20`
                : "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
          >
            <span style={{ fontSize: "1.6rem", lineHeight: 1, filter: isSelected ? "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" : "none" }}>
              {em.emoji}
            </span>
            <span style={{ fontSize: "11px", fontWeight: isSelected ? 700 : 500, color: isSelected ? em.color : "#64748b" }}>
              {em.label}
            </span>
            {isSelected && (
              <div style={{ width: "20px", height: "3px", borderRadius: "2px", background: em.color, opacity: 0.6 }}/>
            )}
          </button>
        );
      })}
    </div>
  );
}