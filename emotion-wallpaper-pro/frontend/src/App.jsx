import { useState, useEffect, useCallback } from "react";
import EmotionGrid, { EMOTIONS } from "./components/EmotionGrid.jsx";
import WallpaperCard from "./components/WallpaperCard.jsx";

const STYLES = [
  { label: "Abstract Fluid",  value: "abstract fluid art with flowing liquid shapes",    icon: "🌊" },
  { label: "Cosmic Nebula",   value: "cosmic nebula with stars galaxies and space dust", icon: "🌌" },
  { label: "Geometric Dream", value: "sharp geometric patterns with clean angles",        icon: "🔷" },
  { label: "Watercolor",      value: "soft watercolor painting with blended washes",     icon: "🎨" },
  { label: "Bioluminescent",  value: "glowing bioluminescent deep ocean organisms",      icon: "✨" },
  { label: "Crystalline",     value: "sharp crystalline fractal ice formations",         icon: "💎" },
];

const SIZES = [
  { label: "Desktop", value: "desktop", icon: "🖥",  display: "1920×1080" },
  { label: "Mobile",  value: "mobile",  icon: "📱",  display: "1080×1920" },
  { label: "Square",  value: "square",  icon: "⬜",  display: "1080×1080" },
];

function loadSaved() {
  try { return JSON.parse(localStorage.getItem("ew_gallery") || "[]"); } catch { return []; }
}

const S = {
  card: {
    background: "#fff",
    borderRadius: "24px",
    border: "2px solid #eef0fa",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    padding: "28px",
    marginBottom: "16px",
  },
  heading: {
    fontSize: "15px", fontWeight: 700, color: "#1e1b4b", marginBottom: "16px",
    display: "flex", alignItems: "center", gap: "8px",
  },
};

function StepBadge({ n, accent }) {
  return (
    <span style={{
      width: 28, height: 28, borderRadius: 8,
      background: `linear-gradient(135deg, ${accent}, #6d28d9)`,
      color: "#fff", fontSize: 12, fontWeight: 800,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>{n}</span>
  );
}

export default function App() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [customMood, setCustomMood]           = useState("");
  const [selectedStyle, setSelectedStyle]     = useState(STYLES[3]);
  const [selectedSize, setSelectedSize]       = useState(SIZES[0]);
  const [intensity, setIntensity]             = useState(70);
  const [generating, setGenerating]           = useState(false);
  const [genStep, setGenStep]                 = useState("");
  const [wallpapers, setWallpapers]           = useState(loadSaved);
  const [activeTab, setActiveTab]             = useState("generate");
  const [error, setError]                     = useState("");
  const [lastPrompt, setLastPrompt]           = useState("");
  const [backendStatus, setBackendStatus]     = useState(null);

  const checkBackend = () => {
    fetch("/api/health").then(r => r.json()).then(d => setBackendStatus(d)).catch(() => setBackendStatus(null));
  };

  useEffect(() => {
    checkBackend();
    const t = setInterval(checkBackend, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("ew_gallery", JSON.stringify(wallpapers.slice(0, 20))); } catch {}
  }, [wallpapers]);

  const handleGenerate = useCallback(async () => {
    const emotion = customMood.trim() || selectedEmotion?.label;
    if (!emotion) { setError("Please select an emotion or describe your mood."); return; }
    if (!backendStatus) { setError("Backend not running. Run: cd backend && npm start"); return; }

    setError(""); setGenerating(true); setGenStep("Asking Gemini to craft your prompt…");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion, style: selectedStyle.value, size: selectedSize.value, intensity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error.");

      setLastPrompt(data.prompt);
      setGenStep("Image ready! ✨");

      setWallpapers(prev => [{
        id: Date.now(),
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        emotion,
        emotionColor: selectedEmotion?.color || "#7c3aed",
        style: selectedStyle.label,
        size: selectedSize.display,
        intensity,
        createdAt: new Date().toLocaleTimeString(),
      }, ...prev]);

      setActiveTab("gallery");
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false); setGenStep("");
    }
  }, [selectedEmotion, customMood, selectedStyle, selectedSize, intensity, backendStatus]);

  const handleDownload = (w) => {
    const a = document.createElement("a");
    a.href = w.imageUrl;
    a.download = `${w.emotion}_${w.style}_wallpaper.jpg`.toLowerCase().replace(/\s+/g, "_");
    a.click();
  };

  const handleDelete = (id) => setWallpapers(prev => prev.filter(w => w.id !== id));

  const accent    = selectedEmotion?.color || "#7c3aed";
  const accentBg  = selectedEmotion?.bg    || "#faf5ff";
  const backendOk = backendStatus?.status === "ok";

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f2ff 0%, #fdf4ff 40%, #f0f9ff 100%)",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
        @keyframes pulse-soft { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes spin { to{transform:rotate(360deg)} }

        .gen-btn {
          width:100%; padding:18px; border-radius:20px; border:none;
          color:white; font-size:16px; font-weight:700; cursor:pointer;
          background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 50%,#4f46e5 100%);
          box-shadow:0 8px 24px rgba(124,58,237,0.35);
          transition:all 0.3s ease;
        }
        .gen-btn:not(:disabled):hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(124,58,237,0.45); }
        .gen-btn:not(:disabled):active { transform:translateY(-1px); }
        .gen-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .gen-btn.loading {
          background:linear-gradient(90deg,#7c3aed 0%,#a78bfa 40%,#7c3aed 80%);
          background-size:200% auto;
          animation:shimmer 1.5s linear infinite;
        }
        .style-option {
          display:flex; align-items:center; gap:10px;
          padding:12px 16px; border-radius:16px;
          font-size:13px; cursor:pointer;
          transition:all 0.2s ease; border:2px solid transparent;
          background:#fafbff; font-family:inherit;
        }
        .style-option:hover { background:#f5f3ff; border-color:#ddd6fe; }
        .text-input {
          width:100%; padding:14px 18px;
          background:#fafbff; border:2px solid #eef0fa;
          border-radius:16px; font-size:14px; color:#1e293b;
          outline:none; transition:all 0.2s ease; font-family:inherit;
        }
        .text-input:focus { border-color:#a78bfa; background:#fff; box-shadow:0 0 0 4px rgba(167,139,250,0.12); }
        .size-btn {
          flex:1; padding:14px 8px; border-radius:18px;
          display:flex; flex-direction:column; align-items:center; gap:6px;
          cursor:pointer; transition:all 0.2s ease;
          border:2px solid #eef0fa; background:#fafbff; font-family:inherit;
        }
        .size-btn:hover { border-color:#c4b5fd; background:#faf5ff; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", width:600, height:600, top:-200, right:-150, background:`radial-gradient(circle, ${accent}20, transparent 65%)`, filter:"blur(80px)", transition:"background 1.2s ease", animation:"blob 12s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", width:500, height:500, bottom:-150, left:-150, background:"radial-gradient(circle, #0ea5e922, transparent 65%)", filter:"blur(70px)", animation:"blob 16s ease-in-out infinite reverse" }}/>
        <div style={{ position:"absolute", width:350, height:350, top:"35%", left:"45%", background:"radial-gradient(circle, #ec489915, transparent 65%)", filter:"blur(60px)", animation:"blob 20s ease-in-out infinite" }}/>
      </div>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:"900px", margin:"0 auto", padding:"48px 24px 64px" }}>

        {/* HEADER */}
        <div style={{ textAlign:"center", marginBottom:"48px", animation:"fadeUp 0.7s ease forwards" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"8px 20px", borderRadius:"50px", marginBottom:20,
            background:"linear-gradient(135deg,#f3f0ff,#fdf2f8)",
            border:"2px solid #e9d5ff", fontSize:12, fontWeight:700,
            color:"#7c3aed", letterSpacing:"0.05em",
          }}>
            ✦ GENERATIVE ART STUDIO
          </div>

          <h1 style={{
            fontFamily:"'Playfair Display', Georgia, serif",
            fontStyle:"italic", fontWeight:600,
            fontSize:"clamp(2.8rem,6vw,4.2rem)",
            color:"#1e1b4b", letterSpacing:"-0.02em",
            lineHeight:1.1, marginBottom:16,
          }}>
            Emotion Wallpaper
          </h1>

          <p style={{ fontSize:16, color:"#64748b", marginBottom:24 }}>
            Choose a feeling, pick a style — get a stunning wallpaper in seconds
          </p>

          <div style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
            {[
              { text:"🌸 Love + Watercolor", c:"#ec4899" },
              { text:"🔥 Rage + Abstract",   c:"#ef4444" },
              { text:"🌌 Wonder + Nebula",   c:"#0ea5e9" },
              { text:"🌿 Serenity + Crystal",c:"#10b981" },
            ].map(ex => (
              <span key={ex.text} style={{
                padding:"6px 16px", borderRadius:"50px", fontSize:12, fontWeight:500,
                background:"#fff", border:`2px solid ${ex.c}22`, color:"#64748b",
                boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
              }}>{ex.text}</span>
            ))}
          </div>
        </div>

        {/* STATUS */}
        {!backendStatus && (
          <div style={{ marginBottom:20, padding:"14px 20px", borderRadius:18, background:"#fff5f5", border:"2px solid #fecaca", display:"flex", alignItems:"center", gap:14, animation:"fadeUp 0.4s ease forwards" }}>
            <span style={{ fontSize:22 }}>⚠️</span>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#dc2626" }}>Backend not running</p>
              <p style={{ fontSize:12, color:"#f87171", marginTop:2 }}>
                Terminal: <code style={{ background:"#fff0f0", padding:"2px 8px", borderRadius:6, fontFamily:"monospace" }}>cd backend</code> → <code style={{ background:"#fff0f0", padding:"2px 8px", borderRadius:6, fontFamily:"monospace" }}>npm start</code>
              </p>
            </div>
          </div>
        )}
        {backendOk && (
          <div style={{ marginBottom:20, padding:"12px 20px", borderRadius:18, background:"linear-gradient(135deg,#f0fdf4,#ecfdf5)", border:"2px solid #bbf7d0", display:"flex", alignItems:"center", gap:10, animation:"fadeUp 0.4s ease forwards" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#22c55e", animation:"pulse-soft 2s ease infinite" }}/>
            <span style={{ fontSize:13, fontWeight:600, color:"#16a34a" }}>Backend connected · Ready to generate</span>
          </div>
        )}

        {/* TABS */}
        <div style={{ display:"flex", gap:6, padding:6, marginBottom:24, background:"#fff", borderRadius:22, border:"2px solid #eef0fa", boxShadow:"0 4px 16px rgba(0,0,0,0.05)" }}>
          {["generate","gallery"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex:1, padding:"12px 0", borderRadius:16, border:"none",
              fontSize:14, fontWeight:600, cursor:"pointer",
              transition:"all 0.25s ease",
              background: activeTab===tab ? `linear-gradient(135deg,${accent},#6d28d9)` : "transparent",
              color: activeTab===tab ? "#fff" : "#94a3b8",
              boxShadow: activeTab===tab ? `0 6px 20px ${accent}45` : "none",
              fontFamily:"inherit",
            }}>
              {tab==="gallery" ? `🖼 Gallery${wallpapers.length>0?` (${wallpapers.length})`:""}`  : "✦ Generate"}
            </button>
          ))}
        </div>

        {/* GENERATE TAB */}
        {activeTab === "generate" && (
          <div style={{ animation:"fadeUp 0.4s ease forwards" }}>

            {/* Step 1 */}
            <div style={S.card}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <div style={S.heading}>
                  <StepBadge n="1" accent={accent}/>
                  Choose Your Emotion
                </div>
                {selectedEmotion && (
                  <div style={{ padding:"6px 16px", borderRadius:"50px", fontSize:12, fontWeight:700, background:accentBg, color:accent, border:`2px solid ${accent}30`, display:"flex", alignItems:"center", gap:6 }}>
                    {selectedEmotion.emoji} {selectedEmotion.label} <span style={{ fontSize:10, opacity:0.7 }}>✓</span>
                  </div>
                )}
              </div>
              <EmotionGrid selected={selectedEmotion} onSelect={(em) => { setSelectedEmotion(em); setCustomMood(""); setError(""); }}/>
              <div style={{ marginTop:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{ flex:1, height:1, background:"#eef0fa" }}/>
                  <span style={{ fontSize:12, fontWeight:500, color:"#94a3b8" }}>or describe your mood</span>
                  <div style={{ flex:1, height:1, background:"#eef0fa" }}/>
                </div>
                <input type="text" className="text-input" value={customMood}
                  onChange={e => { setCustomMood(e.target.value); if(e.target.value) setSelectedEmotion(null); setError(""); }}
                  placeholder="e.g. bittersweet longing, electric anticipation, quiet despair…"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div style={S.card}>
              <div style={S.heading}><StepBadge n="2" accent={accent}/> Pick a Visual Style</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {STYLES.map(s => {
                  const isSel = selectedStyle.value === s.value;
                  return (
                    <button key={s.value} onClick={() => setSelectedStyle(s)} className="style-option"
                      style={{
                        background: isSel ? accentBg : "#fafbff",
                        borderColor: isSel ? accent : "transparent",
                        color: isSel ? accent : "#475569",
                        fontWeight: isSel ? 700 : 500,
                        boxShadow: isSel ? `0 4px 16px ${accent}25` : "none",
                      }}>
                      <span style={{ fontSize:"1.3rem" }}>{s.icon}</span>
                      <span>{s.label}</span>
                      {isSel && <span style={{ marginLeft:"auto" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3 + 4 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

              <div style={{ ...S.card, marginBottom:0 }}>
                <div style={S.heading}><StepBadge n="3" accent={accent}/> Wallpaper Size</div>
                <div style={{ display:"flex", gap:10 }}>
                  {SIZES.map(sz => {
                    const isSel = selectedSize.value === sz.value;
                    return (
                      <button key={sz.value} onClick={() => setSelectedSize(sz)} className="size-btn"
                        style={{
                          background: isSel ? accentBg : "#fafbff",
                          borderColor: isSel ? accent : "#eef0fa",
                          color: isSel ? accent : "#64748b",
                          boxShadow: isSel ? `0 4px 16px ${accent}25` : "none",
                          transform: isSel ? "scale(1.04)" : "scale(1)",
                        }}>
                        <span style={{ fontSize:"1.6rem" }}>{sz.icon}</span>
                        <span style={{ fontSize:12, fontWeight: isSel ? 700 : 500 }}>{sz.label}</span>
                        <span style={{ fontSize:9, opacity:0.5 }}>{sz.display}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ ...S.card, marginBottom:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={S.heading}><StepBadge n="4" accent={accent}/> Intensity</div>
                  <span style={{ fontSize:22, fontWeight:800, color:accent, fontFamily:"monospace" }}>{intensity}%</span>
                </div>
                <p style={{ fontSize:12, color:"#94a3b8", marginBottom:16 }}>
                  {intensity < 35 ? "🌸 Soft and dreamy" : intensity < 65 ? "🎨 Balanced and rich" : "🔥 Bold and dramatic"}
                </p>
                <input type="range" min="10" max="100" value={intensity}
                  onChange={e => setIntensity(Number(e.target.value))}
                  style={{ accentColor: accent }} />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, color:"#94a3b8" }}>
                  <span>Subtle</span><span>Extreme</span>
                </div>
                {(selectedEmotion || customMood) && (
                  <div style={{ marginTop:16, padding:"12px 14px", borderRadius:14, background:`linear-gradient(135deg,${accentBg},white)`, border:`2px solid ${accent}25` }}>
                    <p style={{ fontSize:11, fontWeight:700, color:accent, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Your combo</p>
                    <p style={{ fontSize:13, color:"#334155", fontWeight:500, lineHeight:1.5 }}>
                      {selectedEmotion?.emoji || "🎭"} <strong>{customMood || selectedEmotion?.label}</strong>
                      <span style={{ color:"#94a3b8" }}> × </span>
                      {selectedStyle.icon} <strong>{selectedStyle.label}</strong>
                      <span style={{ color:"#94a3b8" }}> @ </span>
                      <strong style={{ color:accent }}>{intensity}%</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom:16, padding:"14px 18px", borderRadius:16, background:"#fff5f5", border:"2px solid #fecaca", fontSize:13, fontWeight:500, color:"#dc2626" }}>
                ⚠️ {error}
              </div>
            )}

            {/* Last prompt */}
            {lastPrompt && !generating && (
              <div style={{ marginBottom:16, padding:"16px 18px", borderRadius:18, background:"linear-gradient(135deg,#f8f7ff,#fdf2f8)", border:"2px solid #ddd6fe" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#7c3aed", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>✦ Gemini's art prompt</p>
                <p style={{ fontSize:13, color:"#6d28d9", lineHeight:1.7, fontStyle:"italic" }}>"{lastPrompt}"</p>
              </div>
            )}

            {/* Generate button */}
            <button onClick={handleGenerate} disabled={generating || !backendOk}
              className={`gen-btn${generating?" loading":""}`}>
              {generating ? (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                  <svg style={{ width:20, height:20, animation:"spin 0.8s linear infinite" }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity:0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path style={{ opacity:0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span style={{ fontWeight:400 }}>{genStep}</span>
                </span>
              ) : (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                  ✦ Generate Wallpaper
                  {selectedEmotion && (
                    <span style={{ opacity:0.75, fontSize:13, fontWeight:400 }}>
                      — {selectedEmotion.emoji} {selectedEmotion.label} × {selectedStyle.icon} {selectedStyle.label}
                    </span>
                  )}
                </span>
              )}
            </button>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === "gallery" && (
          <div style={{ animation:"fadeUp 0.4s ease forwards" }}>
            {wallpapers.length === 0 ? (
              <div style={{ ...S.card, textAlign:"center", padding:"80px 40px", marginBottom:0 }}>
                <div style={{ fontSize:"5rem", marginBottom:20, display:"inline-block", animation:"float 3s ease-in-out infinite" }}>🎨</div>
                <p style={{ fontSize:18, fontWeight:700, color:"#1e1b4b", marginBottom:8 }}>No wallpapers yet</p>
                <p style={{ fontSize:14, color:"#94a3b8", marginBottom:28 }}>Generate your first masterpiece!</p>
                <button onClick={() => setActiveTab("generate")} className="gen-btn" style={{ maxWidth:240, margin:"0 auto" }}>
                  Start Creating ✦
                </button>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:"#475569" }}>
                    {wallpapers.length} wallpaper{wallpapers.length!==1?"s":""} saved
                  </p>
                  <button onClick={() => { setWallpapers([]); localStorage.removeItem("ew_gallery"); }}
                    style={{ fontSize:12, fontWeight:600, color:"#f87171", background:"none", border:"none", cursor:"pointer" }}>
                    Clear all ×
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:20 }}>
                  {wallpapers.map((w,i) => (
                    <WallpaperCard key={w.id} wallpaper={w} onDownload={handleDownload} onDelete={handleDelete} index={i}/>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <p style={{ textAlign:"center", fontSize:12, color:"#c0c4d6", marginTop:48 }}>
          Prompts by Gemini 2.5 Flash · Images by Pollinations.ai · Completely free
        </p>
      </div>
    </div>
  );
}