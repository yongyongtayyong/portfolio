// Food atlas: a dotted world map of destinations, then an editorial map of
// New York + Jersey City split into neighbourhood cells you can filter, shade,
// zoom into and roll the dice on.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = "http://www.w3.org/2000/svg";
const sv = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.append(e);
  return e;
};
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const money = (n) => (n ? "$".repeat(n) : "");


// ═══════════════════════════ world ══════════════════════════════════════════
// Miller, 1000 × 466, longitudes −170…190 (matches public/food/land.json)
const ym = (lat) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * (lat * Math.PI) / 180));
const Y_TOP = ym(80);
const worldXY = (lat, lng) => {
  const lon = lng < -170 ? lng + 360 : lng;
  return [((lon + 170) * 1000) / 360, ((Y_TOP - ym(clamp(lat, -85, 85))) * 1000) / (2 * Math.PI)];
};

function world(D) {
  const box = $("[data-world]");
  if (!box) return;
  const svg = box.querySelector("svg"), dots = svg.querySelector(".w-dots"), pinsG = svg.querySelector(".w-pins");

  // merge the two map destinations (NY + NJ) into one pin
  const pins = [];
  for (const [key, d] of Object.entries(D.destinations)) {
    const n = D.places.filter((p) => p.state === key).length;
    const twin = d.map && pins.find((p) => p.map === d.map);
    if (twin) { twin.n += n; twin.keys.push(key); continue; }
    pins.push({ key, keys: [key], map: d.map, name: d.map ? "New York + NJ" : d.name, ll: d.ll, n });
  }
  const [nx, ny] = worldXY(40.73, -73.99);
  svg.style.setProperty("--ox", (nx / 10).toFixed(1) + "%");
  svg.style.setProperty("--oy", ((ny / 466) * 100).toFixed(1) + "%");

  pins.forEach((p, i) => {
    const [x, y] = worldXY(p.ll[0], p.ll[1]);
    const left = p.map; // NYC label sits left of its pin, the rest to the right
    const g = sv("g", { class: "w-pin", transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})`, style: `--i:${i}`, tabindex: 0, role: "button", "aria-label": `${p.name}, ${p.n} spots` }, pinsG);
    g.dataset.keys = p.keys.join(",");
    sv("circle", { class: "pin-ring", r: 6 }, g);
    sv("circle", { class: "pin-dot", r: 5.5 }, g);
    sv("line", { x1: left ? -8 : 8, y1: 0, x2: left ? -26 : 26, y2: 0 }, g);
    const t = sv("text", { x: left ? -30 : 30, y: 3.6, "text-anchor": left ? "end" : "start" }, g);
    t.textContent = p.name + " ";
    const n = sv("tspan", { class: "pin-n" }, t);
    n.textContent = String(p.n).padStart(2, "0");
    const go = () => openDest(p.keys[0], true);
    g.addEventListener("click", go);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    g.addEventListener("mouseenter", () => hotDest(p.keys, true));
    g.addEventListener("mouseleave", () => hotDest(p.keys, false));
  });

  // halftone land, computed once from the coastline path
  fetch("/food/land.json").then((r) => r.json()).then((land) => {
    const path = new Path2D(land.d);
    const ctx = document.createElement("canvas").getContext("2d");
    const step = innerWidth < 700 ? 9 : 6.5;
    let d = "";
    for (let row = 0, y = step / 2; y < land.h; y += step * 0.866, row++) {
      for (let x = (row % 2 ? step : step / 2); x < land.w; x += step) {
        if (ctx.isPointInPath(path, x, y)) d += `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
      }
    }
    dots.setAttribute("d", d);
    dots.setAttribute("stroke-width", (step * 0.42).toFixed(2));
  }).catch(() => {});

  const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { box.classList.add("in"); io.disconnect(); } }, { threshold: 0.25 });
  io.observe(box);

  $$("[data-dest-btn]").forEach((b) => {
    const key = b.dataset.destBtn;
    b.addEventListener("click", () => openDest(key, false));
    b.addEventListener("mouseenter", () => hotPin(key, true));
    b.addEventListener("mouseleave", () => hotPin(key, false));
  });
  function hotPin(key, on) { $$(".w-pin").forEach((g) => { if (g.dataset.keys.split(",").includes(key)) g.classList.toggle("hot", on); }); }
  function hotDest(keys, on) { keys.forEach((k) => $(`[data-dest="${k}"]`)?.classList.toggle("hot", on)); }
  function openDest(key) {
    dispatchEvent(new CustomEvent("fa:dest", { detail: D.destinations[key]?.map ? "ny" : key }));
    $("#atlas")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
}

// ═══════════════════════════ atlas ══════════════════════════════════════════
const LAT0 = 40.74, C = Math.cos((LAT0 * Math.PI) / 180), K = 10000;
const xy = (lat, lon) => [(lon + 74) * C * K, (LAT0 - lat) * K];
const LANDMASS = { Manhattan: "manhattan", Queens: "brooklynQueens", Brooklyn: "brooklynQueens", "Jersey City": "newJersey" };
const RAMP = ["--h1", "--h2", "--h3", "--h4", "--h5"];
const LENS = {
  count: { title: "Spots", cuts: [2, 4, 6, 10], labels: ["1", "2–3", "4–5", "6–9", "10+"], value: (ps) => ps.length },
  score: { title: "Avg score", cuts: [7, 7.5, 8, 8.5], labels: ["<7", "7", "7.5", "8", "8.5+"], value: (ps) => { const r = ps.filter((p) => p.rating != null); return r.length ? r.reduce((s, p) => s + p.rating, 0) / r.length : null; } },
};
const bucket = (lens, v) => { let i = 0; while (i < lens.cuts.length && v >= lens.cuts[i]) i++; return i; };

function atlas(D) {
  const svg = $("[data-map]");
  if (!svg) return;
  const { LAND, RIVERS, VIEWS, OUTSIDE } = D.geo;
  const metro = D.places.filter((p) => p.state === "ny" || p.state === "nj");
  const S = { groups: new Set(), min: 0, prices: new Set(), lens: "count", q: "", area: null, place: null, sort: "rating", view: "all" };

  // ── areas on the map ──
  const inMap = Object.entries(D.areas).filter(([name, a]) => (a.state === "ny" || a.state === "nj") && !OUTSIDE.includes(name) && LANDMASS[a.borough]);
  const A = inMap.map(([name, a]) => ({ name, ...a, id: slug(name), mass: LANDMASS[a.borough], p: xy(a.ll[0], a.ll[1]) }));
  const R = 150;
  const clipHalf = (poly, f) => {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
      if (fa <= 0) out.push(a);
      if ((fa <= 0) !== (fb <= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  };
  A.forEach((a) => {
    let poly = Array.from({ length: 56 }, (_, i) => { const t = (i / 56) * Math.PI * 2; return [a.p[0] + Math.cos(t) * R, a.p[1] + Math.sin(t) * R]; });
    A.forEach((o) => {
      if (o === a || o.mass !== a.mass) return;
      const mx = (a.p[0] + o.p[0]) / 2, my = (a.p[1] + o.p[1]) / 2, nx = o.p[0] - a.p[0], ny = o.p[1] - a.p[1];
      poly = clipHalf(poly, (q) => (q[0] - mx) * nx + (q[1] - my) * ny);
    });
    a.poly = poly;
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    a.box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  });
  const byName = Object.fromEntries(A.map((a) => [a.name, a]));

  // ── draw ──
  const toD = (pts) => "M" + pts.map(([la, lo]) => xy(la, lo).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z";
  const defs = sv("defs", {}, svg);
  const hatch = sv("pattern", { id: "fa-hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", class: "m-hatch" }, defs);
  sv("line", { x1: 0, y1: 3, x2: 6, y2: 3 }, hatch);
  for (const m of ["manhattan", "brooklynQueens", "newJersey"]) sv("path", { d: toD(LAND[m]) }, sv("clipPath", { id: "fa-clip-" + m }, defs));

  const world = sv("g", {}, svg);
  sv("rect", { class: "m-water", x: -20000, y: -20000, width: 40000, height: 40000 }, world);
  sv("rect", { x: -20000, y: -20000, width: 40000, height: 40000, fill: "url(#fa-hatch)" }, world);
  const landG = sv("g", {}, world);
  Object.values(LAND).forEach((pts) => sv("path", { class: "m-land", d: toD(pts), "vector-effect": "non-scaling-stroke", "stroke-width": 1.2 }, landG));
  Object.values(RIVERS).forEach((pts) => {
    const d = "M" + pts.map(([la, lo]) => xy(la, lo).map((v) => v.toFixed(1)).join(" ")).join("L");
    sv("path", { class: "m-river-edge", d, "stroke-width": 44 }, landG);
    sv("path", { class: "m-river", d, "stroke-width": 40 }, landG);
  });

  // faint type on the land and water
  const type = sv("g", {}, world);
  [["Manhattan", 40.772, -73.977, -61, 64], ["Queens", 40.757, -73.905, 0, 64], ["Brooklyn", 40.703, -73.948, 0, 64], ["Jersey City", 40.748, -74.064, 0, 54]].forEach(([t, la, lo, rot, fs]) => {
    const [x, y] = xy(la, lo);
    const e = sv("text", { class: "m-boro", x, y, "font-size": fs, transform: `rotate(${rot} ${x} ${y})` }, type);
    e.textContent = t;
  });
  [["Hudson River", 40.752, -74.0145, -63], ["East River", 40.7395, -73.966, -72]].forEach(([t, la, lo, rot]) => {
    const [x, y] = xy(la, lo);
    const e = sv("text", { x, y, "font-size": 15, transform: `rotate(${rot} ${x} ${y})`, "text-anchor": "middle", fill: "var(--muted)", "font-style": "italic", "font-family": "var(--italic)" }, type);
    e.textContent = t;
  });

  const cellG = sv("g", {}, svg);
  const masses = {};
  ["manhattan", "brooklynQueens", "newJersey"].forEach((m) => (masses[m] = sv("g", { "clip-path": `url(#fa-clip-${m})` }, cellG)));
  A.forEach((a) => {
    a.cell = sv("path", { class: "m-cell", d: "M" + a.poly.map((q) => q.map((v) => v.toFixed(1)).join(" ")).join("L") + "Z", "vector-effect": "non-scaling-stroke", "stroke-width": 1.6 }, masses[a.mass]);
    a.cell.addEventListener("mouseenter", (e) => hover(a, e));
    a.cell.addEventListener("mousemove", (e) => moveTip(e));
    a.cell.addEventListener("mouseleave", () => hover(null));
    a.cell.addEventListener("click", () => { if (!dragged) selectArea(S.area === a.name ? null : a.name); });
  });
  const spine = sv("line", { class: "m-spine", "vector-effect": "non-scaling-stroke" }, svg);
  const dotG = sv("g", {}, svg);
  const labelG = sv("g", {}, svg);
  A.forEach((a) => {
    a.label = sv("text", { class: "m-label", x: a.p[0], y: a.p[1] }, labelG);
    a.lc = sv("tspan", { class: "m-count", x: a.p[0] }, a.label);
    a.ln = sv("tspan", { x: a.p[0] }, a.label);
    a.ln.textContent = a.name;
  });

  // ── viewport ──
  let vb = [0, 0, 1, 1], ppu = 1, anim = 0;
  const rectOf = (v) => { const [x0, y1] = xy(v.lat[0], v.lon[0]), [x1, y0] = xy(v.lat[1], v.lon[1]); return [x0, y0, x1 - x0, y1 - y0]; };
  const fit = ([x, y, w, h], pad = 1) => {
    const asp = svg.clientWidth / Math.max(1, svg.clientHeight);
    w *= pad; h *= pad;
    const cx = x + (w / pad) / 2, cy = y + (h / pad) / 2;
    if (w / h > asp) h = w / asp; else w = h * asp;
    return [cx - w / 2, cy - h / 2, w, h];
  };
  const apply = () => {
    if (!svg.clientWidth || !svg.clientHeight) return; // hidden (another destination is showing)
    svg.setAttribute("viewBox", vb.map((v) => v.toFixed(2)).join(" "));
    ppu = svg.clientWidth / vb[2];
    const k = 1 / ppu;
    hatch.setAttribute("patternTransform", `scale(${k})`);
    A.forEach((a) => {
      a.label.setAttribute("font-size", (9.5 * k).toFixed(3));
      a.label.setAttribute("stroke-width", (3.5 * k).toFixed(3));
      a.lc.setAttribute("font-size", (17 * k).toFixed(3));
      a.ln.setAttribute("dy", (12 * k).toFixed(3));
    });
    placeDots();
  };
  const goTo = (rect, dur = 950) => {
    cancelAnimationFrame(anim);
    const from = vb.slice(), to = fit(rect);
    if (reduce || dur === 0) { vb = to; apply(); labelVis(); return; }
    const t0 = performance.now();
    const lw0 = Math.log(from[2]), lw1 = Math.log(to[2]);
    const fc = [from[0] + from[2] / 2, from[1] + from[3] / 2], tc = [to[0] + to[2] / 2, to[1] + to[3] / 2];
    const step = (now) => {
      const t = ease(Math.min(1, (now - t0) / dur));
      const w = Math.exp(lw0 + (lw1 - lw0) * t), h = w * (to[3] / to[2]);
      const cx = fc[0] + (tc[0] - fc[0]) * t, cy = fc[1] + (tc[1] - fc[1]) * t;
      vb = [cx - w / 2, cy - h / 2, w, h];
      apply();
      if (t < 1) anim = requestAnimationFrame(step); else labelVis();
    };
    anim = requestAnimationFrame(step);
  };
  const labelVis = () => A.forEach((a) => {
    const wide = (a.box[2] - a.box[0]) * ppu;
    a.ln.style.display = wide > 78 ? "" : "none";
  });

  // drag to pan (mouse), pinch / ctrl-wheel to zoom
  let drag = null, dragged = false;
  svg.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse" || e.button) return; drag = { x: e.clientX, y: e.clientY, vb: vb.slice() }; dragged = false; });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!dragged && Math.hypot(dx, dy) < 5) return;
    dragged = true; svg.classList.add("dragging"); hover(null);
    vb = [drag.vb[0] - dx / ppu, drag.vb[1] - dy / ppu, drag.vb[2], drag.vb[3]]; apply();
  });
  addEventListener("pointerup", () => { if (drag) { drag = null; svg.classList.remove("dragging"); setTimeout(() => (dragged = false), 0); } });
  svg.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = svg.getBoundingClientRect(), f = Math.exp(clamp(e.deltaY, -40, 40) * 0.01);
    const mx = vb[0] + (e.clientX - r.left) / ppu, my = vb[1] + (e.clientY - r.top) / ppu;
    const w = clamp(vb[2] * f, 120, 4000), k = w / vb[2];
    vb = [mx - (mx - vb[0]) * k, my - (my - vb[1]) * k, w, vb[3] * k]; apply(); labelVis();
  }, { passive: false });

  // ── filtering ──
  const pass = (p, skip) => {
    if (skip !== "group" && S.groups.size && !S.groups.has(p.group)) return false;
    if (S.min && (p.rating == null || p.rating < S.min)) return false;
    if (skip !== "price" && S.prices.size && !S.prices.has(p.price)) return false;
    if (S.q) { const h = (p.name + " " + (p.roman || "") + " " + p.cuisine + " " + (p.dish || "") + " " + p.area).toLowerCase(); if (!h.includes(S.q)) return false; }
    return true;
  };
  const filtered = () => metro.filter((p) => pass(p));

  // chips
  const chipBox = $("[data-chips]");
  const chips = ["All", ...D.groups].map((g) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip" + (g === "All" ? " on" : ""); b.dataset.g = g;
    b.innerHTML = esc(g) + "<sup></sup>";
    b.addEventListener("click", () => {
      if (g === "All") S.groups.clear(); else S.groups.has(g) ? S.groups.delete(g) : S.groups.add(g);
      render();
    });
    chipBox.append(b);
    return b;
  });
  $$("[data-seg]").forEach((seg) => {
    const kind = seg.dataset.seg;
    seg.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const v = b.dataset.v;
      if (kind === "min") S.min = +v;
      if (kind === "lens") S.lens = v;
      if (kind === "price") { const n = +v; S.prices.has(n) ? S.prices.delete(n) : S.prices.add(n); }
      render();
    });
  });
  const search = $("[data-search]");
  search?.addEventListener("input", () => { S.q = search.value.trim().toLowerCase(); render(); });
  $$("[data-sort]").forEach((b) => b.addEventListener("click", () => { S.sort = b.dataset.sort; render(); }));
  $$("[data-view]").forEach((b) => b.addEventListener("click", () => { S.view = b.dataset.view; S.area = null; S.place = null; render(); goTo(rectOf(VIEWS[S.view])); }));
  $("[data-back]")?.addEventListener("click", () => selectArea(null));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && S.area) selectArea(null); });

  // outside cards
  const outBox = $("[data-outside]");
  const outCards = OUTSIDE.filter((n) => D.areas[n]).map((name) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "out-card"; b.dataset.area = name;
    b.innerHTML = `${esc(name)}${D.areas[name].borough !== name ? ` <span class="muted">${esc(D.areas[name].borough)}</span>` : ""}<b></b>`;
    b.addEventListener("click", () => selectArea(S.area === name ? null : name));
    outBox?.append(b);
    return b;
  });

  // ── selection ──
  function selectArea(name, placeId = null) {
    S.area = name; S.place = placeId;
    const a = name && byName[name];
    if (a) {
      const [x0, y0, x1, y1] = a.box;
      const w = Math.max(x1 - x0, 170), h = Math.max(y1 - y0, 120);
      goTo(padRect([(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h], 1.35), 1000);
    } else if (!name) goTo(rectOf(VIEWS[S.view]));
    history.replaceState(null, "", name ? "#atlas/" + slug(name) : location.pathname + location.search);
    render();
    if (placeId) requestAnimationFrame(() => $(`.pl[data-id="${placeId}"]`)?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }));
  }
  const padRect = ([x, y, w, h], k) => [x - (w * (k - 1)) / 2, y - (h * (k - 1)) / 2, w * k, h * k];

  // ── tooltip ──
  const tip = $("[data-tip]"), box = svg.parentElement;
  function hover(a, e) {
    A.forEach((o) => { const on = o === a && S.area !== o.name; o.cell.classList.toggle("hot", on); o.label.classList.toggle("on-ink", on || S.area === o.name); });
    if (!a) { tip.hidden = true; return; }
    const ps = filtered().filter((p) => p.area === a.name);
    const sc = LENS.score.value(ps);
    const top = ps.slice().sort((x, y) => (y.rating ?? 0) - (x.rating ?? 0))[0];
    tip.innerHTML = `<b>${esc(a.name)}</b>${esc(a.borough)} · ${ps.length} ${ps.length === 1 ? "spot" : "spots"}${sc != null ? " · avg " + sc.toFixed(1) : ""}${top ? `<span class="tt-top">Top: ${esc(top.name)} ${top.rating ?? ""}</span>` : ""}`;
    tip.hidden = false;
    if (e) moveTip(e);
  }
  function moveTip(e) {
    const r = box.getBoundingClientRect();
    let x = e.clientX - r.left, y = e.clientY - r.top;
    if (x > r.width - 260) x -= 290;
    if (y > r.height - 120) y -= 130;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }

  // ── dots ──
  const dotEls = new Map();
  metro.forEach((p) => {
    const a = byName[p.area];
    if (!a) return;
    const g = sv("g", { class: "m-pg" }, dotG);
    const c = sv("circle", { class: "m-dot" + (p.rating >= 9 ? " top" : ""), "vector-effect": "non-scaling-stroke", "stroke-width": 1.5 }, g);
    const t = sv("text", { class: "m-plabel" }, g);
    t.textContent = p.name;
    c.addEventListener("click", (e) => { e.stopPropagation(); if (!dragged) selectArea(p.area, p.id); });
    c.addEventListener("mouseenter", () => hotPlace(p.id, true));
    c.addEventListener("mouseleave", () => hotPlace(p.id, false));
    dotEls.set(p.id, { p, a, g, c, t });
  });
  function placeDots() {
    const close = ppu > 1.35, show = close || !!(S.area && byName[S.area]);
    dotG.style.display = show ? "" : "none";
    if (!show) { spine.style.display = "none"; return; }
    const k = 1 / ppu, gap = 13 * k + 4;
    const liveList = filtered().sort((x, y) => (y.rating ?? 0) - (x.rating ?? 0));
    const live = new Set(liveList.map((p) => p.id));
    const order = {}, totals = {};
    liveList.forEach((p) => { totals[p.area] = (totals[p.area] || 0) + 1; order[p.id] = totals[p.area] - 1; });
    dotEls.forEach((d) => {
      const on = live.has(d.p.id) && (close || d.a.name === S.area);
      d.g.style.display = on ? "" : "none";
      if (!on) return;
      const i = order[d.p.id], n = totals[d.a.name];
      let x, y;
      if (S.area === d.a.name || ppu > 4.5) {
        // a neat column, best first, like stops on a line: labels never collide
        x = d.a.p[0]; y = d.a.p[1] + (i - (n - 1) / 2) * 24 * k;
      } else {
        const ang = (i + 1) * 2.39996, rad = gap * Math.sqrt(i + 1.6);
        x = d.a.p[0] + Math.cos(ang) * rad; y = d.a.p[1] + Math.sin(ang) * rad;
      }
      d.c.setAttribute("cx", x.toFixed(2)); d.c.setAttribute("cy", y.toFixed(2));
      d.c.setAttribute("r", ((S.place === d.p.id ? 8 : 5.5) * k).toFixed(3));
      const named = S.area === d.a.name || ppu > 4.5;
      d.t.style.display = named ? "" : "none";
      if (named) {
        d.t.setAttribute("x", (x + 9 * k).toFixed(2)); d.t.setAttribute("y", (y + 4 * k).toFixed(2));
        d.t.setAttribute("font-size", (11.5 * k).toFixed(3)); d.t.setAttribute("stroke-width", (3.5 * k).toFixed(3));
      }
    });
    drawSpine();
  }
  function drawSpine() {
    const a = S.area && byName[S.area];
    const ys = a ? [...dotEls.values()].filter((d) => d.a === a && d.g.style.display !== "none").map((d) => +d.c.getAttribute("cy")) : [];
    spine.style.display = ys.length > 1 && dotG.style.display !== "none" ? "" : "none";
    if (ys.length > 1) { spine.setAttribute("x1", a.p[0]); spine.setAttribute("x2", a.p[0]); spine.setAttribute("y1", Math.min(...ys)); spine.setAttribute("y2", Math.max(...ys)); }
  }
  function hotPlace(id, on) {
    dotEls.get(id)?.c.classList.toggle("hot", on);
    $(`.pl[data-id="${id}"]`)?.classList.toggle("hot", on);
    const a = dotEls.get(id)?.a;
    if (a && !S.area) a.cell.classList.toggle("hot", on);
  }

  // ── render ──
  const list = $("[data-p-list]"), empty = $("[data-p-empty]");
  function render() {
    const F = filtered();
    const lens = LENS[S.lens];
    // chips: count what each would show given the other filters
    const base = metro.filter((p) => pass(p, "group"));
    chips.forEach((b) => {
      const g = b.dataset.g, n = g === "All" ? base.length : base.filter((p) => p.group === g).length;
      b.querySelector("sup").textContent = n;
      b.classList.toggle("on", g === "All" ? !S.groups.size : S.groups.has(g));
      b.classList.toggle("zero", !n);
    });
    $$("[data-seg]").forEach((seg) => $$("button", seg).forEach((b) => {
      const k = seg.dataset.seg, v = b.dataset.v;
      b.classList.toggle("on", k === "min" ? +v === S.min : k === "lens" ? v === S.lens : S.prices.has(+v));
    }));
    $$("[data-view]").forEach((b) => b.classList.toggle("on", b.dataset.view === S.view && !S.area));
    $$("[data-sort]").forEach((b) => b.classList.toggle("on", b.dataset.sort === S.sort));
    $("[data-back]").hidden = !S.area;

    // cells
    A.forEach((a) => {
      const ps = F.filter((p) => p.area === a.name);
      const v = lens.value(ps);
      const emptyCell = !ps.length || v == null;
      a.cell.classList.toggle("empty", emptyCell);
      a.cell.classList.toggle("sel", S.area === a.name);
      a.cell.classList.toggle("dim", !!S.area && S.area !== a.name);
      a.cell.style.fill = emptyCell ? "" : `var(${RAMP[bucket(lens, v)]})`;
      a.lc.textContent = ps.length ? (S.lens === "score" && v != null ? v.toFixed(1) : String(ps.length)) : "–";
      a.label.style.opacity = S.area === a.name ? 0 : S.area ? 0.25 : 1;
      a.label.classList.toggle("on-ink", S.area === a.name);
    });
    outCards.forEach((b) => {
      b.classList.toggle("on", S.area === b.dataset.area);
      b.querySelector("b").textContent = F.filter((p) => p.area === b.dataset.area).length;
    });

    // legend
    $("[data-legend]").innerHTML = `<span>${lens.title}</span><span class="lg-steps">${lens.labels.map((l, i) => `<span><i style="background:var(${RAMP[i]})"></i>${l}</span>`).join("")}<span><i style="background:var(--paper-3)"></i>0</span></span>`;

    // panel
    const a = S.area;
    const inPanel = (a ? F.filter((p) => p.area === a) : F).slice().sort(S.sort === "name" ? (x, y) => x.name.localeCompare(y.name) : (x, y) => (y.rating ?? -1) - (x.rating ?? -1) || x.name.localeCompare(y.name));
    const info = a ? D.areas[a] : null;
    $("[data-p-kicker]").textContent = a ? `${info.borough}${info.state === "nj" ? ", New Jersey" : ", New York"}` : S.groups.size ? [...S.groups].join(" + ") : "New York & New Jersey";
    if (!rolling) $("[data-p-title]").textContent = a || (S.q ? `“${S.q}”` : "Everywhere");
    $("[data-p-n]").textContent = inPanel.length;
    const sc = LENS.score.value(inPanel);
    $("[data-p-avg]").textContent = sc != null ? sc.toFixed(1) : "—";
    empty.hidden = !!inPanel.length;
    list.innerHTML = inPanel.map((p, i) => {
      const more = [p.dish && `Order: ${esc(p.dish)}.`, p.note && esc(p.note)].filter(Boolean).join(" ");
      return `<li class="pl${S.place === p.id ? " open" : ""}" data-id="${p.id}" style="--i:${i}">
        <button type="button" class="pl-btn" aria-expanded="${S.place === p.id}">
          <span class="pl-r${p.rating >= 9 ? " top" : ""}">${p.rating ?? "–"}</span>
          <span><span class="pl-n">${esc(p.name)}</span><span class="pl-m">${esc(p.cuisine)}${p.price ? " · " + money(p.price) : ""}${a ? "" : " · " + esc(p.area)}</span></span>
          <span class="pl-bar" aria-hidden="true"><i style="width:${(p.rating ?? 0) * 10}%"></i></span>
        </button>
        <div class="pl-more"><div>${more ? `<p>${more}</p>` : ""}<a href="${p.maps}" target="_blank" rel="noopener">Open in Google Maps ↗</a></div></div>
      </li>`;
    }).join("");
    placeDots();
  }
  list.addEventListener("click", (e) => {
    const li = e.target.closest(".pl"); if (!li || e.target.closest("a")) return;
    const id = li.dataset.id, d = dotEls.get(id), p = d?.p || metro.find((q) => q.id === id);
    if (S.place === id) { S.place = null; li.classList.remove("open"); li.querySelector(".pl-btn").setAttribute("aria-expanded", "false"); placeDots(); return; }
    if (p && p.area !== S.area && (byName[p.area] || OUTSIDE.includes(p.area))) { selectArea(p.area, id); return; }
    S.place = id;
    $$(".pl.open", list).forEach((o) => o.classList.remove("open"));
    li.classList.add("open"); li.querySelector(".pl-btn").setAttribute("aria-expanded", "true");
    placeDots();
  });
  list.addEventListener("mouseover", (e) => { const li = e.target.closest(".pl"); if (li) hotPlace(li.dataset.id, true); });
  list.addEventListener("mouseout", (e) => { const li = e.target.closest(".pl"); if (li) hotPlace(li.dataset.id, false); });

  // ── surprise me: the title slot-machines through names, then lands ──
  let rolling = false;
  $("[data-surprise]")?.addEventListener("click", () => {
    const pool = filtered();
    if (!pool.length || rolling) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const title = $("[data-p-title]");
    rolling = true;
    const t0 = performance.now(), dur = reduce ? 0 : 900;
    let last = 0;
    const spin = (now) => {
      const k = (now - t0) / dur;
      if (k < 1) {
        if (now - last > 40 + k * 140) { last = now; title.textContent = pool[Math.floor(Math.random() * pool.length)].name; }
        requestAnimationFrame(spin);
      } else {
        rolling = false;
        title.textContent = pick.name;
        selectArea(pick.area, pick.id);
        title.textContent = pick.area;
      }
    };
    requestAnimationFrame(spin);
    $("#atlas .atlas")?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  });

  // panel matches the map's height on desktop
  const sync = () => { $("[data-panel]").style.setProperty("--panel-h", svg.getBoundingClientRect().height + "px"); };
  new ResizeObserver(() => { if (!svg.clientWidth) return; sync(); vb = fit(S.area && byName[S.area] ? padRect(byName[S.area].box, 1.35) : rectOf(VIEWS[S.view])); apply(); labelVis(); }).observe(svg);

  // start
  vb = fit(rectOf(VIEWS.all)); apply(); labelVis();
  render();
  const m = location.hash.match(/^#atlas\/(.+)$/);
  if (m) {
    const name = Object.keys(D.areas).find((n) => slug(n) === m[1]);
    if (name) setTimeout(() => { $("#atlas")?.scrollIntoView(); selectArea(name); }, 300);
  }
}

// boot (after every const above exists)
const raw = $("#food-data");
if (raw) { const D = JSON.parse(raw.textContent); world(D); atlas(D); abroad(D); }

// ═══════════════════════════ abroad ═════════════════════════════════════════
// Same look as New York: hatched water, paper land, hand-drawn coast. Few spots,
// so every one gets a label, stacked to one side with leader lines.
function abroad(D) {
  const tabs = $("[data-dtabs]"), mini = $("[data-mini]"), svg = $("[data-mini-map]");
  if (!tabs || !mini || !svg) return;
  const nyOnly = $(".ny-only");
  const title = $("[data-a-title]"), kicker = $("[data-a-kicker]");
  const nyTitle = title.textContent, nyKicker = kicker.textContent;
  const A = D.geo.ABROAD;
  let cur = "ny", redraw = () => {};

  function show(key) {
    if (key !== "ny" && !A[key]) key = "ny";
    cur = key;
    $$("button", tabs).forEach((b) => b.classList.toggle("on", b.dataset.d === key));
    const ny = key === "ny";
    nyOnly.hidden = !ny; mini.hidden = ny;
    if (ny) { title.textContent = nyTitle; kicker.textContent = nyKicker; return; }
    const places = D.places.filter((p) => p.state === key);
    title.textContent = A[key].label;
    kicker.textContent = `${places.length} ${places.length === 1 ? "spot" : "spots"} · ${D.destinations[key].country}`;
    requestAnimationFrame(() => draw(key, places));
  }
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-d]"); if (!b) return;
    show(b.dataset.d);
    history.replaceState(null, "", b.dataset.d === "ny" ? "#atlas" : "#map-" + b.dataset.d);
  });
  addEventListener("fa:dest", (e) => show(e.detail));
  const h = location.hash.match(/^#map-(\w+)/);
  if (h) setTimeout(() => { show(h[1]); $("#atlas")?.scrollIntoView(); }, 200);
  new ResizeObserver(() => { if (cur !== "ny") redraw(); }).observe(svg);

  function draw(key, places) {
    const g = A[key];
    const lat0 = (g.view.lat[0] + g.view.lat[1]) / 2, lon0 = (g.view.lon[0] + g.view.lon[1]) / 2;
    const c = Math.cos((lat0 * Math.PI) / 180), K = 1000;
    const pr = (la, lo) => [(lo - lon0) * c * K, (lat0 - la) * K];
    const W = svg.clientWidth || 800, H = svg.clientHeight || 500;
    const [x0, y1] = pr(g.view.lat[0], g.view.lon[0]), [x1, y0] = pr(g.view.lat[1], g.view.lon[1]);
    let w = x1 - x0, h = y1 - y0;
    const asp = W / H, cx = x0 + w / 2, cy = y0 + h / 2;
    if (w / h > asp) h = w / asp; else w = h * asp;
    const vb = [cx - w / 2, cy - h / 2, w, h], k = w / W; // map units per screen px
    svg.innerHTML = "";
    svg.setAttribute("viewBox", vb.join(" "));
    const defs = sv("defs", {}, svg);
    const hatch = sv("pattern", { id: "fm-hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", class: "m-hatch", patternTransform: `scale(${k})` }, defs);
    sv("line", { x1: 0, y1: 3, x2: 6, y2: 3 }, hatch);
    const toD = (pts, close = true) => "M" + pts.map(([la, lo]) => pr(la, lo).map((v) => v.toFixed(2)).join(" ")).join("L") + (close ? "Z" : "");
    const big = { x: vb[0] - w, y: vb[1] - h, width: w * 3, height: h * 3 };
    if (g.base === "land") sv("rect", { ...big, class: "m-land", stroke: "none" }, svg);
    else { sv("rect", { ...big, class: "m-water" }, svg); sv("rect", { ...big, fill: "url(#fm-hatch)" }, svg); }
    g.land.forEach((pts) => sv("path", { class: "m-land", d: toD(pts), "vector-effect": "non-scaling-stroke", "stroke-width": 1.2 }, svg));
    (g.water || []).forEach((pts) => {
      sv("path", { d: toD(pts), class: "m-water", stroke: "var(--coast)", "vector-effect": "non-scaling-stroke", "stroke-width": 1.2 }, svg);
      sv("path", { d: toD(pts), fill: "url(#fm-hatch)" }, svg);
    });
    g.rivers.forEach((r) => {
      const d = toD(r.pts, false);
      sv("path", { class: "m-river-edge", d, "stroke-width": r.w + 2.4 * k }, svg);
      sv("path", { class: "m-river", d, "stroke-width": r.w }, svg);
      sv("path", { d, fill: "none", stroke: "url(#fm-hatch)", "stroke-width": r.w }, svg);
    });
    g.type.forEach(([t, la, lo, rot, isLand]) => {
      const [x, y] = pr(la, lo);
      const e = sv("text", isLand
        ? { class: "m-boro", x, y, "font-size": 40 * k, transform: `rotate(${rot} ${x} ${y})` }
        : { x, y, "font-size": 15 * k, transform: `rotate(${rot} ${x} ${y})`, "text-anchor": "middle", fill: "var(--muted)", "font-style": "italic", "font-family": "var(--italic)" }, svg);
      e.textContent = t;
    });

    // dots, with labels stacked to one side on leader lines
    const pts = places.map((p) => ({ p, xy: pr(...(g.places[p.name] || [lat0, lon0])) })).sort((a, b) => a.xy[1] - b.xy[1]);
    const right = Math.max(...pts.map((q) => q.xy[0])), left = Math.min(...pts.map((q) => q.xy[0]));
    const narrow = W < 560, fs = narrow ? 11.5 : 14, off = (narrow ? 26 : 70) * k;
    const labelW = Math.max(...pts.map((q) => q.p.name.length)) * fs * 0.56 * k;
    const roomR = vb[0] + vb[2] - (right + off), roomL = left - off - vb[0];
    const flip = roomR < labelW && roomL > roomR;
    const lx = flip ? left - off : right + off;
    const midY = pts.reduce((s, q) => s + q.xy[1], 0) / Math.max(1, pts.length);
    const gap = (narrow ? 30 : 40) * k;
    const callG = sv("g", {}, svg), dotG = sv("g", {}, svg);
    pts.forEach((q, i) => {
      const ly = midY + (i - (pts.length - 1) / 2) * gap;
      const ex = lx + (flip ? 16 * k : -16 * k);
      sv("polyline", { points: `${q.xy[0]},${q.xy[1]} ${ex},${ly} ${lx},${ly}`, fill: "none", stroke: "var(--ink)", "stroke-width": 1, "vector-effect": "non-scaling-stroke" }, callG);
      const t = sv("text", { x: lx + (flip ? -6 * k : 6 * k), y: ly + 4.5 * k, "font-size": fs * k, "text-anchor": flip ? "end" : "start", class: "m-plabel", "stroke-width": 4 * k }, callG);
      t.textContent = q.p.name;
      sv("circle", { class: "m-dot top", cx: q.xy[0], cy: q.xy[1], r: 6.5 * k, "vector-effect": "non-scaling-stroke", "stroke-width": 1.5 }, dotG);
    });

    $("[data-m-kicker]").textContent = D.destinations[key].country;
    $("[data-m-title]").textContent = g.label;
    $("[data-m-stats]").textContent = `${places.length} ${places.length === 1 ? "spot" : "spots"} · not scored yet`;
    $("[data-m-list]").innerHTML = places.map((p, i) => `<li class="pl open" style="--i:${i}">
      <div class="pl-btn"><span class="pl-r top">${String(i + 1).padStart(2, "0")}</span><span><span class="pl-n">${esc(p.name)}${p.roman ? ` <span class="muted">${esc(p.roman)}</span>` : ""}</span><span class="pl-m">${esc(p.cuisine)}${p.price ? " · " + money(p.price) : ""}${p.dish ? " · " + esc(p.dish) : ""}</span></span></div>
      <div class="pl-more"><div>${p.note ? `<p>${esc(p.note)}</p>` : ""}<a href="${p.maps}" target="_blank" rel="noopener">Open in Google Maps ↗</a></div></div>
    </li>`).join("");
    redraw = () => draw(key, places);
  }
}
