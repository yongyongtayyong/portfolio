import { useState, useEffect, useMemo } from "react";
import { X, Plus, ExternalLink, ChevronRight, RefreshCw, Trash2, Radio, AlertTriangle, Sparkles, LayoutGrid, Gift, Rocket, Building2 } from "lucide-react";

/* ---------------------------------------------------------
   TOKENS
--------------------------------------------------------- */
const STYLE = `
  .pr-root {
    --bg: #0F1113;
    --surface: #171A1E;
    --surface-2: #1E2228;
    --border: #2A2F37;
    --text: #EDEFF2;
    --text-dim: #9AA1AC;
    --text-faint: #5C636E;
    --live: #FF6A3D;
    --launch: #3FD1B4;
    --upcoming: #E8C547;
    --quiet: #4A505A;
    --warn: #E8C547;
    --dtc: #EDEFF2;
    --meta: #6C7CF5;
    --amazon: #F2A93B;
    --google: #4FB0E8;
    --font-display: 'Manrope', system-ui, sans-serif;
    --font-body: 'Manrope', system-ui, sans-serif;
    --font-mono: 'IBM Plex Mono', 'Courier New', monospace;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    min-height: 100%;
    border-radius: 12px;
    overflow: hidden;
  }
  .pr-display { font-family: var(--font-display); letter-spacing: -0.02em; }
  .pr-mono { font-family: var(--font-mono); }

  .pr-ticker-wrap { border-bottom: 1px solid var(--border); background: var(--surface); overflow: hidden; position: relative; white-space: nowrap; }
  .pr-ticker-track { display: inline-flex; align-items: center; animation: pr-scroll 38s linear infinite; padding: 9px 0; }
  .pr-root:hover .pr-ticker-track { animation-play-state: paused; }
  @keyframes pr-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .pr-ticker-item { display:inline-flex; align-items:center; gap:8px; padding: 0 22px; font-size: 12.5px; color: var(--text-dim); }
  .pr-ticker-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .pr-ticker-item b { color: var(--text); font-weight: 700; }

  .pr-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; transition: border-color .15s ease, transform .15s ease; cursor: pointer; position: relative; }
  .pr-card:hover { border-color: #3A4048; transform: translateY(-1px); }
  .pr-card:focus-visible, .pr-btn:focus-visible, .pr-chip:focus-visible, .pr-input:focus-visible, .pr-tab:focus-visible { outline: 2px solid var(--launch); outline-offset: 2px; }

  .pr-pill { display:inline-flex; align-items:center; gap:6px; font-size: 11px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; padding: 4px 9px; border-radius: 20px; }
  .pr-dot { width:7px; height:7px; border-radius:50%; }
  .pr-chan-dot { width:8px; height:8px; border-radius:2px; }

  .pr-btn { font-family: var(--font-body); font-size: 13px; font-weight: 700; border-radius: 8px; padding: 8px 14px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background .15s ease, border-color .15s ease; }
  .pr-btn:hover { background: #262B32; border-color: #3A4048; }
  .pr-btn:disabled { opacity: .5; cursor: not-allowed; }
  .pr-btn-primary { background: var(--launch); color: #06231D; border-color: var(--launch); }
  .pr-btn-primary:hover { background: #5adfc4; }
  .pr-btn-danger:hover { background: #3a1f1a; border-color: #7a3a2c; color: #ffb199; }

  .pr-chip { font-size: 12px; padding: 6px 10px; border-radius: 7px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-dim); cursor: pointer; text-align: left; font-family: var(--font-body); font-weight: 600; }
  .pr-chip:hover { color: var(--text); border-color: #3A4048; }

  .pr-input, .pr-select, .pr-textarea { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 7px; padding: 8px 10px; color: var(--text); font-size: 13px; font-family: var(--font-body); }
  .pr-input:focus, .pr-select:focus, .pr-textarea:focus { outline: none; border-color: var(--launch); }
  .pr-label { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--text-faint); margin-bottom: 5px; display:block; font-weight: 700; }

  .pr-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
  .pr-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
  .pr-scrollbar::-webkit-scrollbar-track { background: transparent; }

  .pr-progress-bg { height: 4px; border-radius: 4px; background: var(--surface-2); overflow: hidden; }
  .pr-progress-fg { height: 100%; border-radius: 4px; }

  .pr-modal-backdrop { background: rgba(6,7,8,0.72); backdrop-filter: blur(2px); }
  .pr-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; }

  .pr-tabs { display: flex; gap: 4px; padding: 0 24px; border-bottom: 1px solid var(--border); }
  .pr-tab { display:flex; align-items:center; gap:7px; font-size: 13px; font-weight: 700; color: var(--text-faint); background: none; border: none; padding: 12px 14px; cursor: pointer; border-bottom: 2px solid transparent; font-family: var(--font-body); }
  .pr-tab:hover { color: var(--text-dim); }
  .pr-tab.active { color: var(--text); border-bottom-color: var(--launch); }

  .pr-badge-corner { position: absolute; top: -6px; right: -6px; background: var(--warn); color: #2A2100; font-size: 9.5px; font-weight: 800; padding: 3px 7px; border-radius: 20px; display:flex; align-items:center; gap:4px; box-shadow: 0 2px 6px rgba(0,0,0,.4); }

  .pr-source-link { font-size: 11.5px; color: var(--launch); display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; text-decoration: none; font-weight: 600; }
  .pr-source-link:hover { text-decoration: underline; }

  @media (prefers-reduced-motion: reduce) { .pr-ticker-track { animation: none; } }
`;

/* ---------------------------------------------------------
   DATA
--------------------------------------------------------- */
const CHANNELS = [
  { id: "dtc", label: "DTC Site", color: "var(--dtc)" },
  { id: "meta", label: "Meta", color: "var(--meta)" },
  { id: "amazon", label: "Amazon", color: "var(--amazon)" },
  { id: "google", label: "Google", color: "var(--google)" },
];

const DEFAULT_BRANDS = ["Bombas", "Sheec", "Cloud Socks", "lululemon", "Paire", "Stance"];
const NEW_LAUNCH_WINDOW_DAYS = 7;
const MONOGRAM_COLORS = ["#FF6A3D", "#3FD1B4", "#6C7CF5", "#F2A93B", "#4FB0E8", "#E8C547", "#B98CE8", "#7FD858"];

const todayISO = () => new Date().toISOString().slice(0, 10);
function addDays(dateStr, days) { const d = new Date(dateStr); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
const today = todayISO();

function seedSignals() {
  return [
    { id: "s1", brand: "Bombas", type: "promo", title: "[SAMPLE] July 4th Comfort Sale", scope: "select",
      lines: [{ name: "Ankle Socks 6-Pack", detail: "25% off" }, { name: "Performance Running Line", detail: "20% off" }],
      channels: ["dtc", "meta", "google"], start: addDays(today, -2), end: addDays(today, 5),
      notes: "Homepage hero banner + Meta carousel ads pushing the multipack bundle.", sample: true, source: "manual", sourceUrl: null },
    { id: "s3", brand: "Sheec", type: "promo", title: "[SAMPLE] Sitewide Summer Sale", scope: "sitewide", lines: [],
      channels: ["dtc", "amazon"], start: addDays(today, -1), end: addDays(today, 12),
      notes: "20% off entire site, mirrored on Amazon storefront.", sample: true, source: "manual", sourceUrl: null },
    { id: "s4", brand: "Cloud Socks", type: "promo", title: "[SAMPLE] Buy 3 Get 1 Free — No-Show line only", scope: "select",
      lines: [{ name: "No-Show Cushion Sock", detail: "BOGO-style" }], channels: ["dtc", "meta"], start: addDays(today, -3), end: addDays(today, 4),
      notes: "Reads evergreen but landing page shows a 1-week window.", sample: true, source: "manual", sourceUrl: null },
    { id: "s5", brand: "lululemon", type: "promo", title: "[SAMPLE] We Made Too Much — select styles", scope: "select",
      lines: [{ name: "Align leggings, past-season colors", detail: "up to 40% off" }, { name: "Metal Vent Tech tees", detail: "up to 30% off" }],
      channels: ["dtc", "amazon", "google"], start: addDays(today, -10), end: addDays(today, 2),
      notes: "Rotating drop, not sitewide.", sample: true, source: "manual", sourceUrl: null },
    { id: "s7", brand: "Paire", type: "promo", title: "[SAMPLE] Founding Friends 15% off first order", scope: "sitewide", lines: [],
      channels: ["dtc", "meta"], start: addDays(today, -20), end: addDays(today, 40),
      notes: "Looks evergreen rather than dated — confirm end date.", sample: true, source: "manual", sourceUrl: null },
    { id: "s8", brand: "Stance", type: "promo", title: "[SAMPLE] BFCM-style Mid-Year Blowout", scope: "select",
      lines: [{ name: "Clearance / past-season socks", detail: "up to 50% off" }], channels: ["dtc", "amazon"], start: addDays(today, -4), end: addDays(today, 3),
      notes: "Clearance-tier discounting, not hero collections.", sample: true, source: "manual", sourceUrl: null },
  ];
}
function seedWelcome(brandList) { return brandList.map((b) => ({ brand: b, offer: null, lastChecked: null, changed: false, history: [] })); }

const STATUS = {
  live: { label: "Live Promo", color: "var(--live)" },
  upcoming: { label: "Upcoming", color: "var(--upcoming)" },
  launch: { label: "New Launch", color: "var(--launch)" },
  ended: { label: "Ended", color: "var(--quiet)" },
  quiet: { label: "Quiet", color: "var(--quiet)" },
};

function getSignalStatus(sig) {
  if (sig.type === "launch") {
    const daysSince = Math.floor((new Date(today) - new Date(sig.start)) / 86400000);
    return daysSince <= NEW_LAUNCH_WINDOW_DAYS ? "launch" : "ended";
  }
  if (!sig.start || !sig.end) return "live";
  if (today < sig.start) return "upcoming";
  if (today > sig.end) return "ended";
  return "live";
}
function daysLeft(sig) { return Math.ceil((new Date(sig.end) - new Date(today)) / 86400000); }
function totalDays(sig) { return Math.max(1, Math.ceil((new Date(sig.end) - new Date(sig.start)) / 86400000)); }
function elapsedDays(sig) { return Math.min(totalDays(sig), Math.max(0, Math.ceil((new Date(today) - new Date(sig.start)) / 86400000))); }
function fmtDate(d) { if (!d) return "unknown date"; return new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
function daysSinceLaunch(sig) { return Math.floor((new Date(today) - new Date(sig.start)) / 86400000); }

/* ---------------------------------------------------------
   RESEARCH (calls Claude w/ web search from inside the artifact)
--------------------------------------------------------- */
async function researchBrand(brand) {
  const system = `You are a retail competitive-intelligence researcher. Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{"welcomeOffer": string|null, "promos": [{"title":string,"scope":"sitewide"|"select","lines":[{"name":string,"detail":string}],"channels":string[] (subset of "dtc","meta","amazon","google"),"start":string|null,"end":string|null,"notes":string,"sourceUrl":string|null}], "launches": [{"title":string,"channels":string[],"date":string|null,"notes":string,"sourceUrl":string|null}]}
Dates must be YYYY-MM-DD or null. Keep notes under 20 words. Include at most 2 promos and 2 launches — only the most current/significant. sourceUrl should be the specific page you found this on (product/sale page, ad library entry, article) — use null if you can't cite a specific URL. welcomeOffer is the brand's current first-order/signup discount for new customers, or null if none found. Use null instead of guessing when unsure.`;
  const user = `Research the brand "${brand}" (a sock/apparel DTC company). Today's date is ${today}. Check their official site and, if discoverable, Meta Ad Library, Amazon listing, and Google Shopping/Search ads. Report: 1) their current welcome/first-order offer, 2) any active promotions (holiday sales, charity tie-ins, BFCM-style events, clearance, etc), noting sitewide vs specific product lines, 3) any product launched in roughly the last 3 weeks. Cite a source URL for each item where possible. Return the JSON now.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  const data = await res.json();
  const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text);
  const raw = textBlocks.join("\n").trim();
  const cleaned = raw.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

function normalizeOffer(s) { return (s || "").toLowerCase().replace(/[^a-z0-9%]+/g, " ").trim(); }

/* ---------------------------------------------------------
   SMALL COMPONENTS
--------------------------------------------------------- */
function Monogram({ brand, size = 34 }) {
  let hash = 0;
  for (let i = 0; i < brand.length; i++) hash = brand.charCodeAt(i) + ((hash << 5) - hash);
  const color = MONOGRAM_COLORS[Math.abs(hash) % MONOGRAM_COLORS.length];
  const initials = brand.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="pr-display" style={{ width: size, height: size, borderRadius: 8, background: `${color}22`, border: `1px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.38, color, flexShrink: 0 }}>
      {initials}
    </div>
  );
}
function ChannelDots({ ids, size = 8 }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {CHANNELS.map((c) => {
        const active = ids.includes(c.id);
        return <div key={c.id} title={c.label} className="pr-chan-dot" style={{ width: size, height: size, background: active ? c.color : "transparent", border: `1.5px solid ${active ? c.color : "var(--border)"}`, opacity: active ? 1 : 0.5 }} />;
      })}
    </div>
  );
}
function StatusPill({ statusKey }) {
  const s = STATUS[statusKey];
  return <span className="pr-pill" style={{ background: `${s.color}22`, color: s.color }}><span className="pr-dot" style={{ background: s.color }} />{s.label}</span>;
}
function SourceLink({ url }) {
  if (!url) return null;
  return <a href={url} target="_blank" rel="noopener noreferrer" className="pr-source-link" onClick={(e) => e.stopPropagation()}><ExternalLink size={11} /> View source</a>;
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */
export default function PromoRadar() {
  const [brands, setBrands] = useState(null);
  const [signals, setSignals] = useState(null);
  const [welcome, setWelcome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveErr, setSaveErr] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [activeBrand, setActiveBrand] = useState(null);
  const [expandedLines, setExpandedLines] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});
  const [channelFilter, setChannelFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState(null);
  const [refreshLog, setRefreshLog] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [b, s, w, m] = await Promise.all([
          window.storage.get("promo-radar-brands", true).catch(() => null),
          window.storage.get("promo-radar-signals", true).catch(() => null),
          window.storage.get("promo-radar-welcome", true).catch(() => null),
          window.storage.get("promo-radar-meta", true).catch(() => null),
        ]);
        const loadedBrands = b ? JSON.parse(b.value) : DEFAULT_BRANDS;
        setBrands(loadedBrands);
        setSignals(s ? JSON.parse(s.value) : seedSignals());
        const loadedWelcome = w ? JSON.parse(w.value) : seedWelcome(loadedBrands);
        // ensure every brand has a welcome entry even if added later
        const missing = loadedBrands.filter((br) => !loadedWelcome.some((x) => x.brand === br));
        setWelcome([...loadedWelcome, ...seedWelcome(missing)]);
        if (m) { try { setLastRefresh(JSON.parse(m.value).lastRefresh); } catch {} }
      } catch {
        setBrands(DEFAULT_BRANDS);
        setSignals(seedSignals());
        setWelcome(seedWelcome(DEFAULT_BRANDS));
      }
      setLoading(false);
    })();
  }, []);

  async function persistBrands(next) { setBrands(next); try { await window.storage.set("promo-radar-brands", JSON.stringify(next), true); } catch { setSaveErr(true); } }
  async function persistSignals(next) { setSignals(next); try { const r = await window.storage.set("promo-radar-signals", JSON.stringify(next), true); setSaveErr(!r); } catch { setSaveErr(true); } }
  async function persistWelcome(next) { setWelcome(next); try { const r = await window.storage.set("promo-radar-welcome", JSON.stringify(next), true); setSaveErr(!r); } catch { setSaveErr(true); } }
  async function persistMeta(next) { try { await window.storage.set("promo-radar-meta", JSON.stringify(next), true); } catch {} }

  function addSignal(sig) { persistSignals([{ ...sig, id: "u" + Date.now(), source: "manual" }, ...signals]); setShowForm(false); }
  function deleteSignal(id) { persistSignals(signals.filter((s) => s.id !== id)); setConfirmDelete(null); }
  function resetSamples() { persistSignals(seedSignals()); persistWelcome(seedWelcome(brands)); }
  function clearAll() { persistSignals([]); persistWelcome(seedWelcome(brands)); }
  function dismissWelcomeChange(brand) { persistWelcome(welcome.map((w) => (w.brand === brand ? { ...w, changed: false } : w))); }

  function addCompany() {
    const trimmed = newCompanyName.trim();
    if (!trimmed || brands.some((b) => b.toLowerCase() === trimmed.toLowerCase())) { setShowAddCompany(false); setNewCompanyName(""); return; }
    persistBrands([...brands, trimmed]);
    persistWelcome([...welcome, { brand: trimmed, offer: null, lastChecked: null, changed: false, history: [] }]);
    setShowAddCompany(false);
    setNewCompanyName("");
  }
  function removeCompany(brand) {
    persistBrands(brands.filter((b) => b !== brand));
    persistSignals(signals.filter((s) => s.brand !== brand));
    persistWelcome(welcome.filter((w) => w.brand !== brand));
    setActiveBrand(null);
  }

  async function runRefresh() {
    setRefreshing(true);
    setRefreshLog([]);
    let workingSignals = signals.slice();
    let workingWelcome = welcome.slice();
    for (let i = 0; i < brands.length; i++) {
      const brand = brands[i];
      setRefreshStatus(`Researching ${brand} (${i + 1}/${brands.length})…`);
      try {
        const data = await researchBrand(brand);
        workingSignals = workingSignals.filter((s) => !(s.brand === brand && s.source === "research"));
        (data.promos || []).slice(0, 2).forEach((p, idx) => {
          workingSignals.push({
            id: `r-${brand}-promo-${Date.now()}-${idx}`, brand, type: "promo",
            title: p.title || "Untitled promo", scope: p.scope === "select" ? "select" : "sitewide",
            lines: Array.isArray(p.lines) ? p.lines : [], channels: Array.isArray(p.channels) ? p.channels : [],
            start: p.start || today, end: p.end || addDays(today, 7), notes: p.notes || "",
            sample: false, source: "research", fetchedAt: today, sourceUrl: p.sourceUrl || null,
          });
        });
        (data.launches || []).slice(0, 2).forEach((l, idx) => {
          workingSignals.push({
            id: `r-${brand}-launch-${Date.now()}-${idx}`, brand, type: "launch",
            title: l.title || "Untitled launch", scope: null, lines: [],
            channels: Array.isArray(l.channels) ? l.channels : [], start: l.date || today, end: l.date || today,
            notes: l.notes || "", sample: false, source: "research", fetchedAt: today, sourceUrl: l.sourceUrl || null,
          });
        });
        const existing = workingWelcome.find((w) => w.brand === brand) || { brand, offer: null, lastChecked: null, changed: false, history: [] };
        const newOffer = data.welcomeOffer || null;
        let changed = existing.changed;
        let history = existing.history.slice();
        if (newOffer && normalizeOffer(newOffer) !== normalizeOffer(existing.offer)) {
          history = [{ offer: newOffer, date: today }, ...history].slice(0, 10);
          changed = !!existing.offer;
        }
        workingWelcome = workingWelcome.filter((w) => w.brand !== brand).concat([{ brand, offer: newOffer, lastChecked: today, changed, history }]);
        setRefreshLog((log) => [...log, { brand, ok: true, promos: (data.promos || []).length, launches: (data.launches || []).length }]);
      } catch (err) {
        setRefreshLog((log) => [...log, { brand, ok: false, error: "Couldn't fetch or parse research for this brand." }]);
      }
    }
    await persistSignals(workingSignals);
    await persistWelcome(workingWelcome);
    const stamp = new Date().toISOString();
    setLastRefresh(stamp);
    persistMeta({ lastRefresh: stamp });
    setRefreshStatus(null);
    setRefreshing(false);
  }

  const brandData = useMemo(() => {
    if (!signals || !brands) return {};
    const map = {}; brands.forEach((b) => (map[b] = []));
    signals.forEach((s) => { if (map[s.brand]) map[s.brand].push(s); });
    return map;
  }, [signals, brands]);

  function brandHeadline(list) {
    const active = list.filter((s) => !(s.type === "launch" && getSignalStatus(s) === "ended"));
    if (!active.length) return { statusKey: "quiet", sig: null };
    const withStatus = active.map((s) => ({ s, k: getSignalStatus(s) }));
    const live = withStatus.find((x) => x.k === "live"); if (live) return { statusKey: "live", sig: live.s };
    const launch = withStatus.find((x) => x.k === "launch"); if (launch) return { statusKey: "launch", sig: launch.s };
    const upcoming = withStatus.find((x) => x.k === "upcoming"); if (upcoming) return { statusKey: "upcoming", sig: upcoming.s };
    return { statusKey: "quiet", sig: null };
  }

  const tickerItems = useMemo(() => {
    if (!signals) return [];
    return signals.map((s) => ({ ...s, k: getSignalStatus(s) })).filter((s) => s.k === "live" || s.k === "launch").sort((a, b) => a.brand.localeCompare(b.brand));
  }, [signals]);

  if (loading || !brands) {
    return (
      <div className="pr-root" style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{STYLE}</style>
        Loading radar…
      </div>
    );
  }

  return (
    <div className="pr-root">
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{STYLE}</style>

      <div style={{ padding: "20px 24px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Radio size={18} color="var(--launch)" />
            <h1 className="pr-display" style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>PROMO RADAR</h1>
          </div>
          <p style={{ margin: "4px 0 0 27px", fontSize: 12.5, color: "var(--text-faint)" }}>
            Sock &amp; apparel DTC competitive tracker — launches &amp; promos across DTC / Meta / Amazon / Google
          </p>
          {lastRefresh && !refreshing && (
            <p className="pr-mono" style={{ margin: "4px 0 0 27px", fontSize: 10.5, color: "var(--text-faint)" }}>Last auto-refresh: {new Date(lastRefresh).toLocaleString()}</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="pr-btn" onClick={() => setShowAddCompany(true)} disabled={refreshing}><Building2 size={13} /> Add company</button>
          <button className="pr-btn" onClick={resetSamples} title="Restore sample entries" disabled={refreshing}><RefreshCw size={13} /> Reset samples</button>
          <button className="pr-btn" onClick={() => setShowForm(true)} disabled={refreshing}><Plus size={14} /> Log a signal</button>
          <button className="pr-btn pr-btn-primary" onClick={runRefresh} disabled={refreshing}>
            <Sparkles size={14} /> {refreshing ? "Refreshing…" : "Refresh from web"}
          </button>
        </div>
      </div>

      {refreshStatus && (
        <div style={{ margin: "0 24px 10px", fontSize: 12.5, color: "var(--launch)", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="pr-mono">{refreshStatus}</span>
        </div>
      )}
      {!refreshing && refreshLog.length > 0 && (
        <div style={{ margin: "0 24px 10px", fontSize: 11.5, color: "var(--text-faint)" }}>
          Refresh complete — {refreshLog.filter((r) => r.ok).length}/{refreshLog.length} brands updated{refreshLog.some((r) => !r.ok) ? `, ${refreshLog.filter((r) => !r.ok).length} failed (try again)` : ""}.
        </div>
      )}

      <div className="pr-ticker-wrap">
        {tickerItems.length === 0 ? (
          <div style={{ padding: "9px 22px", fontSize: 12.5, color: "var(--text-faint)" }}>No live promos or recent launches logged yet.</div>
        ) : (
          <div className="pr-ticker-track">
            {[...tickerItems, ...tickerItems].map((s, i) => (
              <span className="pr-ticker-item" key={i}>
                <span className="pr-ticker-dot" style={{ background: STATUS[s.k].color }} />
                <b>{s.brand}</b> — {s.title.replace("[SAMPLE] ", "")}
                {s.type === "promo" ? ` · ${daysLeft(s) >= 0 ? `${daysLeft(s)}d left` : "ending soon"}` : " · new"}
              </span>
            ))}
          </div>
        )}
      </div>

      {saveErr && <div style={{ margin: "10px 24px 0", fontSize: 12, color: "var(--live)" }}>Couldn't save that change — it may not persist on reload.</div>}

      <div className="pr-tabs">
        <button className={`pr-tab ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}><LayoutGrid size={14} /> Dashboard</button>
        <button className={`pr-tab ${tab === "welcome" ? "active" : ""}`} onClick={() => setTab("welcome")}><Gift size={14} /> Welcome Offers</button>
        <button className={`pr-tab ${tab === "launches" ? "active" : ""}`} onClick={() => setTab("launches")}><Rocket size={14} /> Product Launches</button>
      </div>

      {tab === "dashboard" && (
        <>
          <div style={{ display: "flex", gap: 8, padding: "16px 24px 0", flexWrap: "wrap" }}>
            <button className="pr-chip" style={channelFilter === null ? { color: "var(--text)", borderColor: "#3A4048" } : {}} onClick={() => setChannelFilter(null)}>All channels</button>
            {CHANNELS.map((c) => (
              <button key={c.id} className="pr-chip" style={channelFilter === c.id ? { color: "var(--text)", borderColor: "#3A4048" } : {}} onClick={() => setChannelFilter(channelFilter === c.id ? null : c.id)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="pr-chan-dot" style={{ width: 7, height: 7, background: c.color }} />{c.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12, padding: "16px 24px 24px" }}>
            {brands.map((brand) => {
              const list = brandData[brand].filter((s) => !channelFilter || s.channels.includes(channelFilter));
              const { statusKey, sig } = brandHeadline(list);
              const liveCount = list.filter((s) => getSignalStatus(s) === "live").length;
              const launchCount = list.filter((s) => getSignalStatus(s) === "launch").length;
              const w = welcome.find((x) => x.brand === brand);
              return (
                <div key={brand} className="pr-card" tabIndex={0} role="button" onClick={() => setActiveBrand(brand)} onKeyDown={(e) => e.key === "Enter" && setActiveBrand(brand)} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, minHeight: 148 }}>
                  {w && w.changed && (
                    <div className="pr-badge-corner" title="Welcome offer changed"><AlertTriangle size={10} /> Offer changed</div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Monogram brand={brand} />
                      <h3 className="pr-display" style={{ margin: 0, fontSize: 16.5, fontWeight: 800 }}>{brand}</h3>
                    </div>
                    <StatusPill statusKey={statusKey} />
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.45, flex: 1 }}>
                    {sig ? sig.title.replace("[SAMPLE] ", "") : "No active promo or recent launch logged."}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <ChannelDots ids={[...new Set(list.flatMap((s) => s.channels))]} />
                    <div className="pr-mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
                      {liveCount > 0 && `${liveCount} live`}{liveCount > 0 && launchCount > 0 && " · "}{launchCount > 0 && `${launchCount} new`}
                      {liveCount === 0 && launchCount === 0 && "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "welcome" && (
        <div style={{ padding: "18px 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "0 0 4px" }}>
            First-order / signup offers are treated as business-as-usual unless they change. A change flags on the main dashboard until you dismiss it here.
          </p>
          {brands.map((brand) => {
            const w = welcome.find((x) => x.brand === brand) || { brand, offer: null, lastChecked: null, changed: false, history: [] };
            const histOpen = !!expandedHistory[brand];
            return (
              <div key={brand} className="pr-card" style={{ padding: 16, cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <Monogram brand={brand} size={30} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <h4 className="pr-display" style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{brand}</h4>
                        {w.changed && <span className="pr-pill" style={{ background: "var(--warn)22", color: "var(--warn)" }}><AlertTriangle size={10} />Changed</span>}
                      </div>
                      <div style={{ fontSize: 13.5, color: "var(--text)" }}>{w.offer || "Not yet researched — click \"Refresh from web\"."}</div>
                      <div className="pr-mono" style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 3 }}>{w.lastChecked ? `Last checked ${fmtDate(w.lastChecked)}` : "Never checked"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {w.history.length > 1 && (
                      <button className="pr-chip" onClick={() => setExpandedHistory((p) => ({ ...p, [brand]: !p[brand] }))}>{histOpen ? "Hide" : "View"} history</button>
                    )}
                    {w.changed && <button className="pr-btn" onClick={() => dismissWelcomeChange(brand)}>Mark as BAU</button>}
                  </div>
                </div>
                {histOpen && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                    {w.history.map((h, i) => (
                      <div key={i} style={{ fontSize: 12, color: "var(--text-dim)", display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg)", borderRadius: 6, border: "1px solid var(--border)" }}>
                        <span>{h.offer}</span><span className="pr-mono" style={{ color: "var(--text-faint)" }}>{fmtDate(h.date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "launches" && (() => {
        const archived = signals.filter((s) => s.type === "launch" && daysSinceLaunch(s) > NEW_LAUNCH_WINDOW_DAYS).sort((a, b) => new Date(b.start) - new Date(a.start));
        return (
          <div style={{ padding: "18px 24px 24px" }}>
            {archived.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>Nothing parked here yet — launches land here once they're more than {NEW_LAUNCH_WINDOW_DAYS} days old.</p>
            ) : archived.map((s) => (
              <div key={s.id} className="pr-card" style={{ padding: 14, cursor: "default", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <Monogram brand={s.brand} size={30} />
                    <div>
                      <div className="pr-mono" style={{ fontSize: 10.5, color: "var(--text-faint)", marginBottom: 3 }}>{s.brand} · {fmtDate(s.start)}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{s.title.replace("[SAMPLE] ", "")}</div>
                      <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{s.notes}</div>
                      <SourceLink url={s.sourceUrl} />
                    </div>
                  </div>
                  <ChannelDots ids={s.channels} />
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {activeBrand && (
        <div className="pr-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", justifyContent: "flex-end" }} onClick={() => setActiveBrand(null)}>
          <div className="pr-scrollbar" style={{ width: "min(480px, 92vw)", height: "100%", background: "var(--surface)", borderLeft: "1px solid var(--border)", overflowY: "auto", padding: 22 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Monogram brand={activeBrand} size={38} />
                <h2 className="pr-display" style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{activeBrand}</h2>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="pr-btn pr-btn-danger" onClick={() => removeCompany(activeBrand)} title="Remove this company"><Trash2 size={13} /></button>
                <button className="pr-btn" onClick={() => setActiveBrand(null)} style={{ padding: 8 }}><X size={15} /></button>
              </div>
            </div>
            {brandData[activeBrand].length === 0 && <p style={{ fontSize: 13, color: "var(--text-faint)" }}>No signals logged for this brand yet.</p>}
            {brandData[activeBrand].slice().sort((a, b) => new Date(b.start) - new Date(a.start)).map((sig) => {
              const statusKey = getSignalStatus(sig);
              const pct = sig.type === "promo" ? Math.round((elapsedDays(sig) / totalDays(sig)) * 100) : null;
              const linesOpen = !!expandedLines[sig.id];
              return (
                <div key={sig.id} className="pr-card" style={{ padding: 16, marginBottom: 12, cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <StatusPill statusKey={statusKey} />
                      {sig.type === "promo" && <span className="pr-pill" style={{ background: "var(--surface-2)", color: "var(--text-dim)" }}>{sig.scope === "sitewide" ? "Sitewide" : "Select lines"}</span>}
                      {sig.sample && <span className="pr-mono" style={{ fontSize: 10, color: "var(--text-faint)" }}>SAMPLE</span>}
                      {sig.source === "research" && <span className="pr-mono" style={{ fontSize: 10, color: "var(--launch)" }}>WEB</span>}
                    </div>
                    <button className="pr-btn pr-btn-danger" style={{ padding: "5px 8px" }} onClick={() => setConfirmDelete(sig.id)} title="Delete this entry"><Trash2 size={12} /></button>
                  </div>
                  <h4 style={{ margin: "10px 0 4px", fontSize: 14.5, fontWeight: 700 }}>{sig.title.replace("[SAMPLE] ", "")}</h4>
                  <div className="pr-mono" style={{ fontSize: 11.5, color: "var(--text-faint)", marginBottom: 10 }}>
                    {sig.type === "launch" ? `Launched ${fmtDate(sig.start)}` : `${fmtDate(sig.start)} → ${fmtDate(sig.end)}`}
                    {sig.type === "promo" && statusKey === "live" && ` · ${daysLeft(sig)}d left`}
                  </div>
                  {sig.type === "promo" && (
                    <div className="pr-progress-bg" style={{ marginBottom: 12 }}>
                      <div className="pr-progress-fg" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: statusKey === "live" ? "var(--live)" : "var(--quiet)" }} />
                    </div>
                  )}
                  {sig.scope === "select" && sig.lines.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <button className="pr-chip" onClick={() => setExpandedLines((p) => ({ ...p, [sig.id]: !p[sig.id] }))} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <ChevronRight size={12} style={{ transform: linesOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                        {linesOpen ? "Hide" : "View"} {sig.lines.length} line{sig.lines.length > 1 ? "s" : ""} on promo
                      </button>
                      {linesOpen && (
                        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                          {sig.lines.map((l, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "7px 10px", background: "var(--bg)", borderRadius: 6, border: "1px solid var(--border)" }}>
                              <span>{l.name}</span><span style={{ color: "var(--text-faint)" }} className="pr-mono">{l.detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <p style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.5, margin: 0 }}>{sig.notes}</p>
                  <SourceLink url={sig.sourceUrl} />
                  <div style={{ marginTop: 10 }}><ChannelDots ids={sig.channels} size={9} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && <SignalForm brands={brands} onClose={() => setShowForm(false)} onSave={addSignal} />}

      {showAddCompany && (
        <div className="pr-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowAddCompany(false)}>
          <div className="pr-modal" style={{ padding: 20, width: 340 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="pr-display" style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800 }}>Add a company</h3>
            <label className="pr-label">Company name</label>
            <input className="pr-input" style={{ marginBottom: 16 }} autoFocus value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCompany()} placeholder="e.g. Feetures" />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="pr-btn" onClick={() => setShowAddCompany(false)}>Cancel</button>
              <button className="pr-btn pr-btn-primary" onClick={addCompany} disabled={!newCompanyName.trim()}>Add</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="pr-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setConfirmDelete(null)}>
          <div className="pr-modal" style={{ padding: 20, width: 300 }} onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: 13.5, margin: "0 0 16px" }}>Delete this signal? This can't be undone.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="pr-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="pr-btn pr-btn-danger" onClick={() => deleteSignal(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "0 24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 11, color: "var(--text-faint)", margin: 0 }}>Entries marked SAMPLE are placeholders — refresh from web or log real findings to replace them. Data here is shared with anyone who opens this dashboard.</p>
        <button className="pr-btn" onClick={clearAll} style={{ fontSize: 11.5 }}>Clear all data</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ADD SIGNAL FORM
--------------------------------------------------------- */
function SignalForm({ brands, onClose, onSave }) {
  const [brand, setBrand] = useState(brands[0]);
  const [type, setType] = useState("promo");
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("sitewide");
  const [lineText, setLineText] = useState("");
  const [channels, setChannels] = useState([]);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDays(today, 7));
  const [notes, setNotes] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  function toggleChannel(id) { setChannels((p) => (p.includes(id) ? p.filter((c) => c !== id) : [...p, id])); }

  function handleSave() {
    if (!title.trim()) return;
    const lines = scope === "select" ? lineText.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [name, detail] = l.split("—").map((s) => s && s.trim());
      return { name: name || l, detail: detail || "" };
    }) : [];
    onSave({ brand, type, title: title.trim(), scope: type === "promo" ? scope : null, lines, channels, start, end: type === "launch" ? start : end, notes: notes.trim(), sourceUrl: sourceUrl.trim() || null, sample: false });
  }

  return (
    <div className="pr-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div className="pr-modal pr-scrollbar" style={{ width: "min(460px, 100%)", maxHeight: "88vh", overflowY: "auto", padding: 22 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 className="pr-display" style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Log a signal</h3>
          <button className="pr-btn" onClick={onClose} style={{ padding: 7 }}><X size={14} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div><label className="pr-label">Brand</label>
            <select className="pr-select" value={brand} onChange={(e) => setBrand(e.target.value)}>{brands.map((b) => <option key={b} value={b}>{b}</option>)}</select>
          </div>
          <div><label className="pr-label">Type</label>
            <select className="pr-select" value={type} onChange={(e) => setType(e.target.value)}><option value="promo">Promo</option><option value="launch">New launch</option></select>
          </div>
        </div>
        <label className="pr-label">Title</label>
        <input className="pr-input" style={{ marginBottom: 12 }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sitewide 4th of July sale" />
        {type === "promo" && (
          <>
            <label className="pr-label">Scope</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button className="pr-chip" style={scope === "sitewide" ? { color: "var(--text)", borderColor: "#3A4048" } : {}} onClick={() => setScope("sitewide")}>Sitewide</button>
              <button className="pr-chip" style={scope === "select" ? { color: "var(--text)", borderColor: "#3A4048" } : {}} onClick={() => setScope("select")}>Select lines</button>
            </div>
          </>
        )}
        {type === "promo" && scope === "select" && (
          <>
            <label className="pr-label">Lines on promo (one per line, optionally "name — detail")</label>
            <textarea className="pr-textarea" rows={3} style={{ marginBottom: 12 }} value={lineText} onChange={(e) => setLineText(e.target.value)} placeholder={"Ankle sock 6-pack — 25% off\nRunning line — 20% off"} />
          </>
        )}
        <label className="pr-label">Channels</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {CHANNELS.map((c) => (
            <button key={c.id} className="pr-chip" style={channels.includes(c.id) ? { color: "var(--text)", borderColor: "#3A4048" } : {}} onClick={() => toggleChannel(c.id)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="pr-chan-dot" style={{ width: 7, height: 7, background: c.color }} /> {c.label}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: type === "launch" ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div><label className="pr-label">{type === "launch" ? "Launch date" : "Start date"}</label><input type="date" className="pr-input" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          {type === "promo" && <div><label className="pr-label">End date</label><input type="date" className="pr-input" value={end} onChange={(e) => setEnd(e.target.value)} /></div>}
        </div>
        <label className="pr-label">Source URL (optional)</label>
        <input className="pr-input" style={{ marginBottom: 12 }} type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://…" />
        <label className="pr-label">Notes — anything else interesting</label>
        <textarea className="pr-textarea" rows={3} style={{ marginBottom: 16 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Creative angle, influencer tie-in, bundle mechanics, etc." />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="pr-btn" onClick={onClose}>Cancel</button>
          <button className="pr-btn pr-btn-primary" onClick={handleSave} disabled={!title.trim()}>Save signal</button>
        </div>
      </div>
    </div>
  );
}