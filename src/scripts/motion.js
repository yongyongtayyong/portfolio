// Site-wide motion & UI: page wipe, text reveals, scramble, scroll-linked transforms,
// marquees, pinned rails, portrait colour lens, cursor labels, lights toggle, ⌘K menu.
// No dependencies. Under reduced motion everything is static and readable.

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
const root = document.documentElement;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = (kind, op, k, v) => { try { const s = kind === "local" ? localStorage : sessionStorage; return op === "get" ? s.getItem(k) : s.setItem(k, v); } catch { return null; } };

// ── page wipe ──────────────────────────────────────────────────────────────
const wipe = document.querySelector(".wipe");
if (wipe && root.classList.contains("t-in")) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    wipe.classList.add("out");
    setTimeout(() => { root.classList.remove("t-in"); wipe.classList.remove("out"); }, 1100);
  }));
}
addEventListener("pageshow", (e) => { if (e.persisted && wipe) { wipe.classList.remove("go", "out"); root.classList.remove("t-in"); } });
function navigate(href, label) {
  const url = new URL(href, location.href);
  if (reduce || !wipe) { location.href = url.href; return; }
  const span = wipe.querySelector("b span");
  if (span) span.textContent = label || "Tay Yong";
  store("session", "set", "ty-wipe", "1");
  wipe.classList.add("go");
  setTimeout(() => { location.href = url.href; }, 720);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if ((a.target && a.target !== "_self") || a.hasAttribute("download") || a.dataset.noWipe !== undefined) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || /\.(pdf|png|jpe?g|zip)$/i.test(url.pathname)) return;
  if (url.pathname === location.pathname) return;
  e.preventDefault();
  navigate(url.href, a.dataset.wipe || a.textContent.trim().split(/\s+/)[0]);
});

// ── split text ─────────────────────────────────────────────────────────────
function splitEl(el) {
  if (el.dataset.splitDone) return;
  const chars = el.dataset.split === "chars";
  let i = 0;
  const walk = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((tok) => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.append(document.createTextNode(tok)); return; }
        const w = document.createElement("span"); w.className = "w";
        if (chars) [...tok].forEach((ch) => { const c = document.createElement("span"); c.className = "c"; c.textContent = ch; c.style.setProperty("--i", i++); w.append(c); });
        else { const s = document.createElement("span"); s.textContent = tok; s.style.setProperty("--i", i++); w.append(s); }
        frag.append(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && !n.classList.contains("no-split")) walk(n);
  });
  walk(el);
  el.classList.add("split"); el.dataset.splitDone = "1";
}
$$("[data-split]").forEach(splitEl);

// ── reveal on view ─────────────────────────────────────────────────────────
function show(el) {
  el.classList.add("in");
  if (el.matches("[data-decode]")) scramble(el, 900);
  if (el.dataset.split === "chars") setTimeout(() => el.classList.add("settled"), 1300 + el.querySelectorAll(".c").length * 38);
}
const io = new IntersectionObserver((es) => es.forEach((en) => {
  if (!en.isIntersecting) return;
  io.unobserve(en.target); show(en.target);
}), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
const arrive = root.classList.contains("t-in") ? 620 : 80;
$$(".reveal, [data-split], .shutter, [data-decode]").forEach((el) => {
  if (el.dataset.now !== undefined) setTimeout(() => show(el), arrive);
  else io.observe(el);
});

// ── text scramble: maths glyphs churn, then resolve left → right ──────────
const GLYPHS = "∑∫∂πλ∞√≈ΔΩθμ∇∈∀∃01".split("");
const scrambling = new WeakMap();
function scramble(el, dur = 520) {
  if (reduce) return;
  const target = el.dataset.text || el.textContent;
  el.dataset.text = target;
  if (!el.style.minWidth) el.style.minWidth = el.getBoundingClientRect().width + "px";
  cancelAnimationFrame(scrambling.get(el));
  const t0 = performance.now();
  const step = (t) => {
    const k = clamp((t - t0) / dur, 0, 1);
    const done = Math.floor(k * target.length);
    let out = "";
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      out += i < done || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (k < 1) scrambling.set(el, requestAnimationFrame(step)); else el.textContent = target;
  };
  scrambling.set(el, requestAnimationFrame(step));
}
$$("[data-scramble]").forEach((el) => {
  const host = el.closest("a, button") || el;
  host.addEventListener("mouseenter", () => scramble(el));
});

// ── counters ───────────────────────────────────────────────────────────────
const cio = new IntersectionObserver((es) => es.forEach((en) => {
  if (!en.isIntersecting) return;
  cio.unobserve(en.target);
  const el = en.target, to = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
  if (reduce) { el.textContent = to.toFixed(dec); return; }
  const t0 = performance.now();
  const f = (t) => { const k = clamp((t - t0) / 1500, 0, 1), e = 1 - Math.pow(1 - k, 4); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}), { threshold: 0.4 });
$$("[data-count]").forEach((el) => cio.observe(el));

// ── clock (with seconds) ───────────────────────────────────────────────────
const clocks = $$("[data-clock]");
if (clocks.length) {
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const tick = () => { const t = fmt.format(new Date()); clocks.forEach((c) => { c.textContent = (c.dataset.clock || "NYC ") + t; }); };
  tick(); setInterval(tick, 1000);
}

// ── toast + copy ───────────────────────────────────────────────────────────
const toastEl = document.querySelector(".toast");
let toastT;
function say(msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 2200); }
async function copy(text, msg) {
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {
    try { const ta = Object.assign(document.createElement("textarea"), { value: text }); ta.style.cssText = "position:fixed;opacity:0"; document.body.append(ta); ta.select(); ok = document.execCommand("copy"); ta.remove(); } catch {}
  }
  say(ok ? msg || "Copied" : text);
}
$$("[data-copy]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); copy(el.dataset.copy, el.dataset.copied); }));

// ── lights (dark mode) with a circular wipe from the switch ───────────────
function setTheme(next, from) {
  const apply = () => { if (next === "dark") root.dataset.theme = "dark"; else delete root.dataset.theme; store("local", "set", "ty-theme", next); };
  if (!document.startViewTransition || reduce) { apply(); return; }
  const r = from ? from.getBoundingClientRect() : { left: innerWidth - 40, top: 20, width: 0, height: 0 };
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = document.startViewTransition(apply);
  vt.ready.then(() => {
    root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
      { duration: 900, easing: "cubic-bezier(0.83, 0, 0.17, 1)", pseudoElement: "::view-transition-new(root)" });
  }).catch(() => {});
}
const toggleTheme = (btn) => setTheme(root.dataset.theme === "dark" ? "light" : "dark", btn);
$$("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => toggleTheme(b)));
const vtStyle = document.createElement("style");
vtStyle.textContent = "::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}";
document.head.append(vtStyle);

// ── ⌘K menu ────────────────────────────────────────────────────────────────
const pal = document.querySelector(".pal");
if (pal) {
  const input = pal.querySelector(".pal-in"), list = pal.querySelector(".pal-list");
  const go = (href, label) => () => { closePal(); navigate(href, label); };
  const items = [
    ["Index", "Page", go("/", "Index")],
    ["Personal — off duty", "Page", go("/personal", "Personal")],
    ["Food atlas", "Page", go("/food", "Food")],
    ["Food in New York", "Map", go("/food#/new-york", "Food")],
    ["Food in New Jersey", "Map", go("/food#/new-jersey", "Food")],
    ["Copy email — hello@tayyong.com", "Action", () => { closePal(); copy("hello@tayyong.com", "Email copied — say hi"); }],
    ["Write an email", "Action", () => { closePal(); location.href = "mailto:hello@tayyong.com"; }],
    ["CV (PDF)", "Link", () => { closePal(); open("/resume.pdf", "_blank", "noopener"); }],
    ["GitHub", "Link", () => { closePal(); open("https://github.com/yongyongtayyong", "_blank", "noopener"); }],
    ["LinkedIn", "Link", () => { closePal(); open("https://www.linkedin.com/in/yong-tay/", "_blank", "noopener"); }],
    ["Lights on / off", "Action", () => { closePal(); toggleTheme(); }],
    ["Back to top", "Action", () => { closePal(); scrollTo({ top: 0, behavior: "smooth" }); }],
  ];
  let shown = items, idx = 0, lastFocus = null;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = items.filter(([l, k]) => !q || (l + " " + k).toLowerCase().includes(q));
    idx = clamp(idx, 0, Math.max(0, shown.length - 1));
    list.innerHTML = shown.map(([l, k], i) => `<li role="option" aria-selected="${i === idx}" class="${i === idx ? "on" : ""}" data-i="${i}"><span>${l}</span><span>${k}</span></li>`).join("") || `<li><span>Nothing for “${input.value.replace(/</g, "&lt;")}”</span><span></span></li>`;
  };
  const openPal = () => { lastFocus = document.activeElement; pal.classList.add("on"); input.value = ""; idx = 0; render(); setTimeout(() => input.focus(), 30); };
  function closePal() { pal.classList.remove("on"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  input.addEventListener("input", () => { idx = 0; render(); });
  list.addEventListener("pointermove", (e) => { const li = e.target.closest("li[data-i]"); if (li && +li.dataset.i !== idx) { idx = +li.dataset.i; render(); } });
  list.addEventListener("click", (e) => { const li = e.target.closest("li[data-i]"); if (li) shown[+li.dataset.i][2](); });
  pal.querySelector("[data-pal-close]").addEventListener("click", closePal);
  $$("[data-palette]").forEach((b) => b.addEventListener("click", openPal));
  document.addEventListener("keydown", (e) => {
    const typing = /input|textarea|select/i.test(document.activeElement?.tagName || "") && !pal.contains(document.activeElement);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.classList.contains("on") ? closePal() : openPal(); return; }
    if (!pal.classList.contains("on")) { if (e.key === "/" && !typing) { e.preventDefault(); openPal(); } return; }
    if (e.key === "Escape") { e.preventDefault(); closePal(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); idx = (idx + 1) % Math.max(1, shown.length); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); idx = (idx - 1 + shown.length) % Math.max(1, shown.length); render(); }
    else if (e.key === "Enter") { e.preventDefault(); shown[idx] && shown[idx][2](); }
  });
}

// ── fit text: [data-fit] grows until it fills its box exactly ─────────────
const fits = $$("[data-fit]");
function fitAll() {
  fits.forEach((el) => {
    const box = el.parentElement.getBoundingClientRect().width;
    el.style.fontSize = "100px";
    const w = el.scrollWidth || 1;
    const k = parseFloat(el.dataset.fit) || 1;
    el.style.fontSize = Math.floor((100 * box * k) / w) + "px";
  });
}
if (fits.length) { fitAll(); (document.fonts?.ready || Promise.resolve()).then(fitAll); addEventListener("resize", fitAll); }

// ── portrait: B&W with a colour lens that follows the pointer ─────────────
$$("[data-lens]").forEach((fig) => {
  const color = fig.querySelector(".lens-color");
  if (!color || !fine || reduce) return;
  let tx = 50, ty = 50, x = 50, y = 50, r = 0, tr = 0, raf = 0;
  const loop = () => {
    x = lerp(x, tx, 0.16); y = lerp(y, ty, 0.16); r = lerp(r, tr, 0.12);
    color.style.setProperty("--mx", x + "%"); color.style.setProperty("--my", y + "%"); color.style.setProperty("--r", r + "px");
    raf = Math.abs(r - tr) > 0.5 || Math.abs(x - tx) > 0.05 || Math.abs(y - ty) > 0.05 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  fig.addEventListener("pointerenter", (e) => { const b = fig.getBoundingClientRect(); x = tx = ((e.clientX - b.left) / b.width) * 100; y = ty = ((e.clientY - b.top) / b.height) * 100; tr = Math.max(140, b.width * 0.14); kick(); });
  fig.addEventListener("pointermove", (e) => { const b = fig.getBoundingClientRect(); tx = ((e.clientX - b.left) / b.width) * 100; ty = ((e.clientY - b.top) / b.height) * 100; kick(); });
  fig.addEventListener("pointerleave", () => { tr = 0; kick(); });
});

// ── cursor label: only over [data-cursor] elements ─────────────────────────
const cur = document.querySelector(".cur");
if (cur && fine && !reduce) {
  let mx = -200, my = -200, cx = -200, cy = -200, on = false, raf = 0;
  const loop = () => {
    cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2);
    cur.style.transform = `translate3d(${(cx + 14).toFixed(1)}px, ${(cy + 16).toFixed(1)}px, 0)`;
    raf = on || Math.abs(cx - mx) > 0.3 ? requestAnimationFrame(loop) : 0;
  };
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; if (on && !raf) raf = requestAnimationFrame(loop); }, { passive: true });
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest("[data-cursor]");
    const label = t ? t.dataset.cursor : "";
    if (label && !on) { cx = mx; cy = my; }
    on = !!label;
    if (label) cur.textContent = label;
    cur.classList.toggle("on", on);
    if (on && !raf) raf = requestAnimationFrame(loop);
  });
}

// ── scroll-linked loop ─────────────────────────────────────────────────────
const header = document.querySelector("header.top");
const progress = document.querySelector(".progress");
const marquees = $$(".vmarquee").map((el) => {
  const track = el.querySelector(".track");
  const unit = track.innerHTML; let g = 0;
  while (track.scrollWidth < innerWidth * 2.2 && g++ < 12) track.insertAdjacentHTML("beforeend", unit);
  track.insertAdjacentHTML("beforeend", track.innerHTML);
  return { track, x: 0, dir: el.dataset.dir === "right" ? 1 : -1, base: parseFloat(el.dataset.mspeed || "0.5") };
});
const parallax = $$("[data-speed]").map((el) => ({ el, s: parseFloat(el.dataset.speed) }));
const dollies = $$("[data-dolly]").map((el) => ({ el, img: el.querySelectorAll("img") }));
const rails = $$(".hscroll").map((el) => ({ el, track: el.querySelector(".hscroll-track"), bar: el.querySelector(".hscroll-bar i"), count: el.querySelector(".hscroll-count"), n: el.querySelectorAll(".card").length, dist: 0 }));
const rises = $$("[data-rise]").map((el) => ({ el, kids: [...el.children] }));
function layoutRails() {
  rails.forEach((r) => {
    if (innerWidth <= 760 || reduce) { r.el.style.height = ""; r.dist = 0; r.track.style.transform = ""; return; }
    r.dist = Math.max(0, r.track.scrollWidth - innerWidth);
    r.el.style.height = innerHeight + r.dist + "px";
  });
}
layoutRails(); addEventListener("resize", layoutRails); addEventListener("load", layoutRails);

let lastY = scrollY, vel = 0, navY = scrollY;
function frame() {
  const y = scrollY, vh = innerHeight;
  vel = lerp(vel, y - lastY, 0.1); lastY = y;
  if (progress) { const max = document.documentElement.scrollHeight - vh; progress.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`; }
  if (header) {
    if (y < 80) { header.classList.remove("hide"); navY = y; }
    else if (y - navY > 80) { header.classList.add("hide"); navY = y; }
    else if (navY - y > 40) { header.classList.remove("hide"); navY = y; }
  }
  if (!reduce) {
    marquees.forEach((m) => {
      const half = m.track.scrollWidth / 2;
      m.x += m.dir * (m.base + Math.min(Math.abs(vel), 50) * 0.3);
      if (m.x <= -half) m.x += half; if (m.x > 0) m.x -= half;
      m.track.style.transform = `translate3d(${m.x.toFixed(2)}px,0,0) skewX(${clamp(-vel * 0.2, -8, 8).toFixed(2)}deg)`;
    });
    parallax.forEach((p) => {
      const r = p.el.getBoundingClientRect(); if (r.bottom < -vh || r.top > vh * 2) return;
      p.el.style.transform = `translate3d(0, ${(-(r.top + r.height / 2 - vh / 2) * p.s).toFixed(1)}px, 0)`;
    });
    dollies.forEach((d) => {
      const r = d.el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      const k = clamp(1 - (r.top + r.height) / (vh + r.height), 0, 1); // 0 entering → 1 leaving
      d.img.forEach((im) => { im.style.translate = `0 ${((k - 0.5) * 14).toFixed(2)}%`; im.style.scale = (1.06 + k * 0.08).toFixed(4); });
    });
    rails.forEach((r) => {
      if (!r.dist) return;
      const k = clamp(-r.el.getBoundingClientRect().top / r.dist, 0, 1);
      r.track.style.transform = `translate3d(${(-k * r.dist).toFixed(1)}px,0,0)`;
      if (r.bar) r.bar.style.transform = `scaleX(${k})`;
      if (r.count) r.count.textContent = String(Math.min(r.n, 1 + Math.floor(k * r.n * 0.999))).padStart(2, "0") + " / " + String(r.n).padStart(2, "0");
    });
    rises.forEach((f) => {
      const r = f.el.getBoundingClientRect(); if (r.top > vh) return;
      const k = clamp((vh - r.top) / (r.height + 40), 0, 1);
      f.kids.forEach((s, i) => { const e = 1 - Math.pow(1 - clamp(k * 1.25 - i * 0.18, 0, 1), 3); s.style.transform = `translate3d(0, ${((1 - e) * 70).toFixed(1)}%, 0)`; });
    });
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ── for the curious ────────────────────────────────────────────────────────
console.log("%cTay Yong", "font: 600 28px 'Inter Tight', sans-serif; letter-spacing: -1px");
console.log("%cYou opened the console. Respect. Say hi → hello@tayyong.com  (tip: press ⌘K)", "font: 12px 'JetBrains Mono', monospace");

export { splitEl, say, scramble, navigate };
