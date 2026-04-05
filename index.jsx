import { useState, useEffect, useCallback } from "react";

const CATEGORIES = [
  { key: "location", label: "Location" },
  { key: "menu", label: "Menu" },
  { key: "servizio", label: "Servizio" },
  { key: "conto", label: "Conto" },
];

const TIPOLOGIE = [
  { key: "colazione", label: "Colazione" },
  { key: "pranzo_cena", label: "Pranzo / Cena" },
  { key: "aperitivo", label: "Aperitivo" },
];

const STORAGE_KEY = "ristoranti_reviews";

const ScoreInput = ({ value, onChange }) => {
  const editable = !!onChange;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {editable && (
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: 120,
            height: 4,
            accentColor: "#1a1a1a",
            cursor: "pointer",
          }}
        />
      )}
      <span style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontWeight: 700,
        fontSize: 20,
        color: "#1a1a1a",
        minWidth: 28,
        textAlign: "right",
        lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  );
};

const Pill = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: "7px 16px",
      borderRadius: 99,
      border: `1.5px solid ${selected ? "#1a1a1a" : "#ddd"}`,
      background: selected ? "#1a1a1a" : "transparent",
      color: selected ? "#fff" : "#888",
      fontFamily: "'Instrument Sans', sans-serif",
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.15s",
      WebkitTapHighlightColor: "transparent",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </button>
);

export default function App() {
  const [reviews, setReviews] = useState([]);
  const [view, setView] = useState("list");
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [loaded, setLoaded] = useState(false);

  const [fn, setFn] = useState("");
  const [ft, setFt] = useState(null);
  const [fr, setFr] = useState({ location: 0, menu: 0, servizio: 0, conto: 0 });
  const [fnote, setFnote] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) setReviews(JSON.parse(r.value));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (data) => {
    setReviews(data);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, []);

  const avg = (r) => {
    const v = CATEGORIES.map((c) => r.ratings[c.key]);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
  };

  const reset = () => { setFn(""); setFt(null); setFr({ location: 0, menu: 0, servizio: 0, conto: 0 }); setFnote(""); setErr(""); };

  const submit = () => {
    if (!fn.trim()) return setErr("Inserisci il nome del locale");
    if (!ft) return setErr("Seleziona una tipologia");
    if (Object.values(fr).some((v) => v == null)) return setErr("Dai un voto a tutte le categorie");
    const item = { id: Date.now().toString(), name: fn.trim(), tipologia: ft, ratings: { ...fr }, note: fnote.trim(), date: new Date().toISOString() };
    save([item, ...reviews]);
    reset();
    setView("list");
  };

  const del = (id) => { save(reviews.filter((r) => r.id !== id)); if (detail?.id === id) { setDetail(null); setView("list"); } };

  const filtered = reviews
    .filter((r) => !filter || r.tipologia === filter)
    .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "rating" ? avg(b) - avg(a) : new Date(b.date) - new Date(a.date));

  const tipLabel = (k) => TIPOLOGIE.find((t) => t.key === k)?.label || "";

  if (!loaded) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "'Instrument Sans', sans-serif", color: "#bbb", fontSize: 14 }}>
      Caricamento…
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, button { font-family: inherit; }
        input::placeholder, textarea::placeholder { color: #c0c0c0; }
        .card-item { transition: background 0.1s; }
        @media (hover: hover) { .card-item:hover { background: #f7f7f7 !important; } }
      `}</style>

      <div style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#fafafa",
        fontFamily: "'Instrument Sans', sans-serif",
        color: "#1a1a1a",
        WebkitFontSmoothing: "antialiased",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "20px 20px 14px",
          background: "rgba(250,250,250,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 10,
          borderBottom: "1px solid #eee",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {view === "list" ? (
              <>
                <div>
                  <h1 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 30, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.1,
                  }}>
                    I miei locali
                  </h1>
                  <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>
                    {reviews.length} {reviews.length === 1 ? "recensione" : "recensioni"}
                  </span>
                </div>
                <button
                  onClick={() => { reset(); setView("add"); }}
                  style={{
                    width: 40, height: 40, borderRadius: 99,
                    border: "none", background: "#1a1a1a", color: "#fff",
                    fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", WebkitTapHighlightColor: "transparent",
                  }}
                >
                  +
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setView("list"); setDetail(null); }}
                  style={{
                    background: "none", border: "none", fontSize: 15, fontWeight: 500,
                    color: "#1a1a1a", cursor: "pointer", padding: "8px 0",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  ← Indietro
                </button>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700 }}>
                  {view === "add" ? "Nuova recensione" : "Dettaglio"}
                </span>
                <div style={{ width: 70 }} />
              </>
            )}
          </div>
        </div>

        {/* ── LIST ── */}
        {view === "list" && (
          <div style={{ padding: "14px 20px 40px" }}>
            <input
              type="text"
              placeholder="Cerca…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: "1.5px solid #e4e4e4", background: "#fff",
                fontSize: 15, color: "#1a1a1a", outline: "none",
                marginBottom: 12, transition: "border-color 0.15s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#1a1a1a"}
              onBlur={(e) => e.target.style.borderColor = "#e4e4e4"}
            />

            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, marginBottom: 10, WebkitOverflowScrolling: "touch" }}>
              <Pill label="Tutti" selected={!filter} onClick={() => setFilter(null)} />
              {TIPOLOGIE.map((t) => (
                <Pill key={t.key} label={t.label} selected={filter === t.key} onClick={() => setFilter(filter === t.key ? null : t.key)} />
              ))}
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 16, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginRight: 4 }}>Ordina</span>
              {[{ k: "date", l: "Recenti" }, { k: "rating", l: "Voto" }].map((s) => (
                <button
                  key={s.k}
                  onClick={() => setSort(s.k)}
                  style={{
                    padding: "4px 10px", borderRadius: 6, border: "none",
                    background: sort === s.k ? "#eee" : "transparent",
                    color: sort === s.k ? "#1a1a1a" : "#bbb",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {s.l}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#ccc" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 6, color: "#aaa" }}>
                  {reviews.length === 0 ? "Nessuna recensione" : "Nessun risultato"}
                </p>
                <p style={{ fontSize: 13 }}>{reviews.length === 0 ? "Tocca + per iniziare" : "Prova a cambiare i filtri"}</p>
              </div>
            ) : (
              <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #eee" }}>
                {filtered.map((r, i) => {
                  const a = avg(r);
                  return (
                    <div
                      className="card-item"
                      key={r.id}
                      onClick={() => { setDetail(r); setView("detail"); }}
                      style={{
                        background: "#fff", padding: "15px 18px", cursor: "pointer",
                        borderBottom: i < filtered.length - 1 ? "1px solid #f2f2f2" : "none",
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 20, fontWeight: 700, lineHeight: 1.2,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {r.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: "#999",
                            background: "#f5f5f5", padding: "2px 8px", borderRadius: 99,
                          }}>
                            {tipLabel(r.tipologia)}
                          </span>
                          <span style={{ fontSize: 11, color: "#ccc" }}>
                            {new Date(r.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'Instrument Sans', sans-serif",
                        fontWeight: 700, fontSize: 24, color: "#1a1a1a",
                        flexShrink: 0, lineHeight: 1,
                      }}>
                        {a.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ADD ── */}
        {view === "add" && (
          <div style={{ padding: "24px 20px 40px" }}>
            <label style={lbl}>Nome del locale</label>
            <input
              type="text"
              placeholder="es. Trattoria da Mario"
              value={fn}
              onChange={(e) => { setFn(e.target.value); setErr(""); }}
              style={inp}
              onFocus={(e) => e.target.style.borderColor = "#1a1a1a"}
              onBlur={(e) => e.target.style.borderColor = "#e4e4e4"}
            />

            <label style={{ ...lbl, marginTop: 22 }}>Tipologia</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              {TIPOLOGIE.map((t) => (
                <Pill key={t.key} label={t.label} selected={ft === t.key} onClick={() => { setFt(t.key); setErr(""); }} />
              ))}
            </div>

            <label style={{ ...lbl, marginTop: 26 }}>Voti</label>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
              {CATEGORIES.map((c, i) => (
                <div key={c.key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: i < CATEGORIES.length - 1 ? "1px solid #f5f5f5" : "none",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{c.label}</span>
                  <ScoreInput value={fr[c.key]} onChange={(v) => { setFr({ ...fr, [c.key]: v }); setErr(""); }} />
                </div>
              ))}
            </div>

            <label style={{ ...lbl, marginTop: 26 }}>Note</label>
            <textarea
              placeholder="Opzionale…"
              value={fnote}
              onChange={(e) => setFnote(e.target.value)}
              rows={3}
              style={{ ...inp, resize: "vertical", lineHeight: 1.5 }}
              onFocus={(e) => e.target.style.borderColor = "#1a1a1a"}
              onBlur={(e) => e.target.style.borderColor = "#e4e4e4"}
            />

            {err && (
              <div style={{
                background: "#fef5f5", border: "1px solid #f0d5d5", borderRadius: 10,
                padding: "10px 14px", marginTop: 16, fontSize: 13, color: "#c44", fontWeight: 500,
              }}>
                {err}
              </div>
            )}

            <button
              onClick={submit}
              style={{
                width: "100%", marginTop: 24, padding: "15px",
                borderRadius: 12, border: "none",
                background: "#1a1a1a", color: "#fff",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Salva
            </button>
          </div>
        )}

        {/* ── DETAIL ── */}
        {view === "detail" && detail && (() => {
          const a = avg(detail);
          return (
            <div style={{ padding: "28px 20px 40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 32, fontWeight: 700, lineHeight: 1.15, flex: 1,
                }}>
                  {detail.name}
                </h2>
                <span style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: 36, fontWeight: 700, flexShrink: 0, marginLeft: 16, lineHeight: 1,
                }}>
                  {a.toFixed(1)}
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 30 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: "#999",
                  background: "#f0f0f0", padding: "3px 12px", borderRadius: 99,
                }}>
                  {tipLabel(detail.tipologia)}
                </span>
                <span style={{ fontSize: 12, color: "#ccc" }}>
                  {new Date(detail.date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              {CATEGORIES.map((c) => (
                <div key={c.key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0", borderBottom: "1px solid #f0f0f0",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#666" }}>{c.label}</span>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <ScoreInput value={detail.ratings[c.key]} />
                  </div>
                </div>
              ))}

              {detail.note && (
                <div style={{
                  background: "#f8f8f8", borderRadius: 10, padding: "14px 16px",
                  marginTop: 24, borderLeft: "3px solid #e0e0e0",
                }}>
                  <p style={{
                    margin: 0, fontSize: 17, lineHeight: 1.6,
                    color: "#777", fontStyle: "italic",
                    fontFamily: "'Cormorant Garamond', serif",
                  }}>
                    {detail.note}
                  </p>
                </div>
              )}

              <button
                onClick={() => { if (confirm("Eliminare questa recensione?")) del(detail.id); }}
                style={{
                  width: "100%", marginTop: 32, padding: "13px",
                  borderRadius: 10, border: "1.5px solid #e8e8e8",
                  background: "transparent", color: "#c44",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Elimina
              </button>
            </div>
          );
        })()}
      </div>
    </>
  );
}

const lbl = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "#aaa",
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginBottom: 8,
};

const inp = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1.5px solid #e4e4e4",
  background: "#fff",
  fontSize: 15,
  color: "#1a1a1a",
  outline: "none",
  transition: "border-color 0.15s",
  fontFamily: "'Instrument Sans', sans-serif",
};
