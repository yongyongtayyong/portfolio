// Little animated loops for the Personal page. Each [data-scene] plays on its own
// clock while it's on screen (no scroll-jacking): a progress value p runs through
// the scene's action range, then loops.
//
// Motion rules used throughout (the stuff that makes animation feel "produced"):
// anticipation before big moves, overshoot + settle on arrivals, follow-through on
// anything attached (plates, noodles, limbs), and staggered (never simultaneous) timing.

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, a, b) => clamp((p - a) / (b - a));
const E = {
  out3: (t) => 1 - Math.pow(1 - t, 3),
  inOut3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t, s = 1.9) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  outElastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
  inBack: (t, s = 1.7) => (s + 1) * t * t * t - s * t * t,
};
// critically-damped-ish spring for follow-through
const spring = (k = 0.12, d = 0.78) => {
  const s = { x: 0, v: 0, to(target) { s.v = (s.v + (target - s.x) * k) * d; s.x += s.v; return s.x; } };
  return s;
};
const NS = "http://www.w3.org/2000/svg";
const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; };

// ═══════════════════════════ 01 · MUSIC — viola & bow ══════════════════════
function music(scene) {
  const svg = scene.querySelector("svg.sc-art");
  const bow = svg.querySelector(".vbow"), strings = [...svg.querySelectorAll(".vstr")], staff = [...svg.querySelectorAll(".staff line")];
  const notesG = svg.querySelector(".notes"), rings = [...svg.querySelectorAll(".fring")];
  const viola = svg.querySelector(".viola");
  const swing = spring(0.08, 0.82);
  let lastOff = 0, lastDir = 0, travelled = 0;
  const notes = [];
  const spawn = (t) => {
    const g = mk("g", { class: "note" }, notesG);
    const big = Math.random() > 0.5;
    mk("ellipse", { cx: 0, cy: 0, rx: 9, ry: 6.5, transform: "rotate(-24)" }, g);
    mk("line", { x1: 8, y1: -2, x2: 8, y2: -38 }, g);
    if (big) mk("path", { d: "M8 -38 q14 6 12 22" }, g);
    notes.push({ g, t0: t, x: 600 + Math.random() * 60, y: 300 + Math.random() * 30, dx: 140 + Math.random() * 160, dy: -(220 + Math.random() * 120), r: (Math.random() - 0.5) * 50 });
  };
  return (p, t) => {
    staff.forEach((l, i) => { const k = E.out3(seg(p, 0.02 + i * 0.03, 0.3 + i * 0.03)); l.style.strokeDashoffset = (1 - k) * 1000; });
    // viola settles into frame with overshoot, then breathes
    const enter = E.outBack(seg(p, 0.05, 0.32), 1.4);
    const sway = Math.sin(t * 1.1) * 1.2;
    viola.setAttribute("transform", `translate(${lerp(900, 640, enter)} ${lerp(80, 40, enter)}) rotate(${(lerp(-60, -28, enter) + sway).toFixed(2)} 100 230)`);
    // bow: three strokes across the scroll, eased like a real stroke (slow at the ends)
    const play = seg(p, 0.3, 0.92);
    const stroke = Math.sin(E.inOut3(play) * Math.PI * 5);
    const off = swing.to(stroke * 120 * Math.min(1, play * 6));
    const v = off - lastOff; lastOff = off;
    bow.setAttribute("transform", `translate(${off.toFixed(1)} 0)`);
    const speed = Math.min(Math.abs(v), 8);
    strings.forEach((s, i) => {
      const x = +s.dataset.x, amp = speed * 0.55 * Math.sin(t * (48 + i * 9));
      s.setAttribute("d", `M${x} 40 Q${(x + amp).toFixed(2)} 210 ${x} 382`);
    });
    // a note escapes every time the bow travels far enough or turns around
    travelled += Math.abs(v);
    const dir = Math.sign(v);
    if (play > 0 && play < 1 && ((dir && dir !== lastDir && travelled > 30) || travelled > 150)) { spawn(t); travelled = 0; }
    if (dir) lastDir = dir;
    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i], k = (t - n.t0) / 2.2;
      if (k >= 1) { n.g.remove(); notes.splice(i, 1); continue; }
      const e = E.out3(k);
      const x = n.x + n.dx * e, y = n.y + n.dy * e + Math.sin(k * 9) * 8;
      n.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(n.r * e).toFixed(1)}) scale(${(E.outBack(Math.min(1, k * 5)) * (1 - k * 0.3)).toFixed(3)})`);
      n.g.style.opacity = (1 - Math.pow(k, 2)).toFixed(3);
    }
    rings.forEach((r, i) => {
      const k = ((t * 0.6 + i * 0.5) % 1);
      r.setAttribute("r", (10 + k * 60 * (0.4 + speed / 8)).toFixed(1));
      r.style.opacity = ((1 - k) * Math.min(1, speed / 3) * 0.7).toFixed(3);
    });
  };
}

// ═══════════════════════════ 02 · TRAINING — the lift ══════════════════════
function training(scene) {
  const svg = scene.querySelector("svg.sc-art");
  const bar = svg.querySelector(".bb-bar"), left = svg.querySelector(".bb-l"), right = svg.querySelector(".bb-r");
  const hands = svg.querySelector(".bb-hands"), shadow = svg.querySelector(".bb-shadow"), dust = svg.querySelector(".dust");
  const rep = scene.querySelector(".sc-rep");
  const bend = spring(0.16, 0.7), wobL = spring(0.1, 0.86), wobR = spring(0.1, 0.86);
  let lastY = 0, lastV = 0, lastRep = 0, lastTop = -1;
  const puffs = [];
  // one rep: brace (anticipation dip) → drive up (fast) → lockout hold → controlled descent
  const repCurve = (f) => {
    if (f < 0.12) return -0.06 * Math.sin((f / 0.12) * Math.PI);
    if (f < 0.42) return E.out3((f - 0.12) / 0.3);
    if (f < 0.6) return 1;
    return 1 - E.inOut3((f - 0.6) / 0.4);
  };
  return (p, t) => {
    const enter = E.outBack(seg(p, 0.04, 0.22), 1.6);
    const reps = seg(p, 0.2, 0.92) * 3;
    const n = Math.min(3, Math.floor(reps) + 1), f = reps >= 3 ? 1 : reps % 1;
    const hgt = p < 0.2 ? 0 : reps >= 3 ? 0 : repCurve(f);
    const y = lerp(160, 0, enter) + 418 - hgt * 270;
    const v = y - lastY, a = v - lastV; lastY = y; lastV = v;
    const b = bend.to(Math.max(-26, Math.min(26, a * 3.2)) + (hgt > 0.95 ? 4 : 0));
    const wl = wobL.to(b * 1.3), wr = wobR.to(b * 1.3);
    bar.setAttribute("d", `M170 ${y.toFixed(1)} Q500 ${(y - b).toFixed(1)} 830 ${y.toFixed(1)}`);
    left.setAttribute("transform", `translate(0 ${(y + wl * 0.4).toFixed(1)}) rotate(${(-wl * 0.35).toFixed(2)} 215 0)`);
    right.setAttribute("transform", `translate(0 ${(y + wr * 0.4).toFixed(1)}) rotate(${(wr * 0.35).toFixed(2)} 785 0)`);
    hands.setAttribute("transform", `translate(0 ${(y - b * 0.55).toFixed(1)})`);
    const s = 1 - hgt * 0.45;
    shadow.setAttribute("transform", `translate(500 520) scale(${(s * enter).toFixed(3)} 1)`);
    shadow.style.opacity = (0.18 + 0.1 * s).toFixed(3);
    if (rep) rep.textContent = `Rep ${String(p < 0.2 ? 0 : n).padStart(2, "0")} / 03`;
    // chalk puff at every lockout
    const atTop = hgt > 0.98 ? n : -1;
    if (atTop > 0 && atTop !== lastTop) {
      [400, 600].forEach((hx) => { for (let i = 0; i < 7; i++) { const c = mk("circle", { r: 2 + Math.random() * 4 }, dust); puffs.push({ c, t0: t, x: hx, y: y - 20, dx: (Math.random() - 0.5) * 90, dy: -30 - Math.random() * 60 }); } });
    }
    lastTop = atTop;
    for (let i = puffs.length - 1; i >= 0; i--) {
      const q = puffs[i], k = (t - q.t0) / 1.1;
      if (k >= 1) { q.c.remove(); puffs.splice(i, 1); continue; }
      const e = E.out3(k);
      q.c.setAttribute("cx", (q.x + q.dx * e).toFixed(1)); q.c.setAttribute("cy", (q.y + q.dy * e).toFixed(1));
      q.c.style.opacity = ((1 - k) * 0.5).toFixed(3);
    }
    lastRep = n;
  };
}

// ═══════════════════════════ 03 · CLIMBING — the send ══════════════════════
function climbing(scene) {
  const svg = scene.querySelector("svg.sc-art");
  const wall = svg.querySelector(".wall-g");
  const part = (k) => svg.querySelector(".cl-" + k);
  const done = svg.querySelector(".done-tag"), topHold = svg.querySelector(".w-route.top");
  // route: each move changes one limb. coordinates are on the wall (taller than the frame)
  const H = (x, y) => ({ x, y });
  const moves = [
    { LH: H(430, 1060), RH: H(560, 1040), LF: H(420, 1300), RF: H(560, 1290) },
    { RH: H(600, 930) }, { LF: H(450, 1180) }, { LH: H(470, 880) }, { RF: H(590, 1120) },
    { RH: H(610, 760) }, { LF: H(430, 1010) }, { LH: H(470, 690) }, { RF: H(600, 930) },
    { RH: H(580, 560) }, { LF: H(460, 840) }, { LH: H(520, 470) }, { RF: H(580, 760) },
    { RH: H(545, 380) },
  ];
  const states = [];
  moves.reduce((s, m) => { const n = { ...s, ...m }; states.push(n); return n; }, {});
  const bodyY = spring(0.08, 0.8), bodyX = spring(0.08, 0.8), cam = spring(0.06, 0.82);
  bodyY.x = 1150; bodyX.x = 495; cam.x = -700;
  const ik = (a, b, l1, l2, bendDir) => {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
    const ang = Math.atan2(dy, dx), cos = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
    const th = ang + bendDir * Math.acos(clamp(cos, -1, 1));
    return { x: a.x + Math.cos(th) * l1, y: a.y + Math.sin(th) * l1 };
  };
  const limbs = { LH: [-1, 22, -1], RH: [1, 22, 1], LF: [-1, 66, 1], RF: [1, 66, -1] };
  return (p, t) => {
    const k = seg(p, 0.08, 0.88) * (states.length - 1);
    const i = Math.min(states.length - 2, Math.floor(k)), f = k - i;
    const A = states[i], B = states[i + 1];
    const moving = Object.keys(B).find((key) => A[key].x !== B[key].x || A[key].y !== B[key].y);
    const pos = {};
    ["LH", "RH", "LF", "RF"].forEach((key) => {
      if (key !== moving) { pos[key] = { ...B[key] }; return; }
      // reach along an arc, slight wind-up first (anticipation), overshoot onto the hold
      const e = f < 0.15 ? -0.05 * Math.sin((f / 0.15) * Math.PI) : E.outBack((f - 0.15) / 0.85, 1.3);
      const lift = Math.sin(clamp(e) * Math.PI) * 38;
      pos[key] = { x: lerp(A[key].x, B[key].x, e) + (key[0] === "L" ? -lift : lift) * 0.6, y: lerp(A[key].y, B[key].y, e) - lift * 0.3 };
    });
    const hx = (pos.LH.x + pos.RH.x) / 2, hy = (pos.LH.y + pos.RH.y) / 2, fx = (pos.LF.x + pos.RF.x) / 2, fy = (pos.LF.y + pos.RF.y) / 2;
    const cx = bodyX.to(lerp(hx, fx, 0.45)), cy = bodyY.to(lerp(hy, fy, 0.42) + Math.sin(t * 2) * 2);
    const sh = { x: cx + (hx - cx) * 0.12, y: cy - 62 }, hip = { x: cx + (fx - cx) * 0.1, y: cy + 48 };
    const head = { x: sh.x + (hx - sh.x) * 0.05, y: sh.y - 34 };
    const camY = cam.to(-(cy - 330));
    wall.setAttribute("transform", `translate(0 ${camY.toFixed(1)})`);
    part("torso").setAttribute("d", `M${sh.x} ${sh.y} Q${((sh.x + hip.x) / 2 + 6).toFixed(1)} ${((sh.y + hip.y) / 2).toFixed(1)} ${hip.x} ${hip.y}`);
    part("head").setAttribute("cx", head.x.toFixed(1)); part("head").setAttribute("cy", head.y.toFixed(1));
    ["LH", "RH"].forEach((key) => {
      const s = { x: sh.x + limbs[key][0] * 20, y: sh.y }, e = ik(s, pos[key], 62, 62, limbs[key][2]);
      part(key).setAttribute("d", `M${s.x.toFixed(1)} ${s.y.toFixed(1)} L${e.x.toFixed(1)} ${e.y.toFixed(1)} L${pos[key].x.toFixed(1)} ${pos[key].y.toFixed(1)}`);
      part("g" + key).setAttribute("cx", pos[key].x.toFixed(1)); part("g" + key).setAttribute("cy", pos[key].y.toFixed(1));
    });
    ["LF", "RF"].forEach((key) => {
      const s = { x: hip.x + limbs[key][0] * 14, y: hip.y }, e = ik(s, pos[key], 78, 78, limbs[key][2]);
      part(key).setAttribute("d", `M${s.x.toFixed(1)} ${s.y.toFixed(1)} L${e.x.toFixed(1)} ${e.y.toFixed(1)} L${pos[key].x.toFixed(1)} ${pos[key].y.toFixed(1)}`);
      part("g" + key).setAttribute("cx", pos[key].x.toFixed(1)); part("g" + key).setAttribute("cy", pos[key].y.toFixed(1));
    });
    const fin = seg(p, 0.87, 0.93);
    done.style.opacity = fin.toFixed(2);
    done.setAttribute("transform", `translate(${lerp(560, 572, E.outBack(fin))} 382)`);
    topHold.classList.toggle("is-done", fin > 0.5);
  };
}

// ═══════════════════════════ 05 · EATING — the lift ════════════════════════
function eating(scene) {
  const svg = scene.querySelector("svg.sc-art");
  const sticks = svg.querySelector(".sticks"), noodles = [...svg.querySelectorAll(".noodle")], steam = [...svg.querySelectorAll(".steam")];
  const bowl = svg.querySelector(".bowl-g");
  const sp = noodles.map(() => spring(0.07, 0.84));
  return (p, t) => {
    const enter = E.outBack(seg(p, 0.02, 0.2), 1.5);
    bowl.setAttribute("transform", `translate(0 ${lerp(260, 0, enter).toFixed(1)})`);
    // two bites: dip, pull (noodles stretch), pause, drop back; the second higher
    const bite = seg(p, 0.22, 0.9) * 2, f = bite % 1, nb = Math.floor(bite);
    let lift = f < 0.15 ? -0.08 * Math.sin((f / 0.15) * Math.PI) : f < 0.6 ? E.outBack((f - 0.15) / 0.45, 1.2) : 1 - E.inOut3((f - 0.6) / 0.4) * 0.85;
    if (bite >= 2) lift = 0.15;
    const top = lerp(330, nb ? 70 : 120, Math.max(0, lift));
    const tilt = Math.sin(t * 1.6) * 2 + lift * 6;
    sticks.setAttribute("transform", `translate(0 ${(top - 330).toFixed(1)}) rotate(${tilt.toFixed(2)} 560 330)`);
    noodles.forEach((n, i) => {
      const bx = 430 + i * 28, tipx = 548 + i * 6;
      const sag = sp[i].to(Math.max(0, top - 330) * -0.2 + Math.sin(t * 3 + i) * 4);
      const mid = (330 + top) / 2;
      n.setAttribute("d", `M${bx} 338 C${bx + 10} ${(mid + 40 + sag).toFixed(1)}, ${tipx - 30} ${(mid - 10 - sag).toFixed(1)}, ${tipx} ${(top + 2).toFixed(1)}`);
    });
    steam.forEach((s, i) => {
      const k = (t * 0.35 + i * 0.33) % 1;
      s.style.strokeDashoffset = (1 - k) * 260 - 130;
      s.style.opacity = (Math.sin(k * Math.PI) * 0.8 * enter).toFixed(3);
      s.setAttribute("transform", `translate(${(Math.sin(t * 1.2 + i * 2) * 8).toFixed(1)} ${(-k * 30).toFixed(1)})`);
    });
  };
}

// ═══════════════════════════ runner ════════════════════════════════════════
// [start, end, seconds for one pass, seconds to hold at the end]
const LOOP = { music: [0.34, 0.92, 9, 0], training: [0.2, 0.92, 7.5, 0.6], climbing: [0.07, 0.95, 11, 2.4], eating: [0.21, 0.9, 7, 0.4] };
const BUILD = { music, training, climbing, eating };
const scenes = [...document.querySelectorAll("[data-scene]")].map((el) => {
  const make = BUILD[el.dataset.scene];
  return { el, key: el.dataset.scene, clock: 0, intro: 0, update: make ? make(el) : () => {}, live: false };
});
if (scenes.length) {
  const vis = new IntersectionObserver((es) => es.forEach((en) => { const s = scenes.find((x) => x.el === en.target); if (s) s.live = en.isIntersecting; }), { rootMargin: "10% 0px" });
  scenes.forEach((s) => vis.observe(s.el));
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    scenes.forEach((s) => {
      if (!s.live && !reduce) return;
      const [a, b, dur, hold] = LOOP[s.key] || [0, 1, 8, 0];
      if (reduce) { s.update(lerp(a, b, 0.6), t); return; }
      // first time on screen: play the entrance (0 → a), then loop the action
      if (s.intro < 1) { s.intro = Math.min(1, s.intro + dt / 1.4); s.update(a * E.out3(s.intro), t); return; }
      const prev = s.clock;
      s.clock = (s.clock + dt) % (dur + hold);
      if (s.clock < prev) for (let i = 0; i < 90; i++) s.update(a, t); // settle springs on restart
      const k = Math.min(1, s.clock / dur);
      // fade between passes so a loop never "teleports"
      const edge = Math.min(s.clock, dur + hold - s.clock);
      if (s.key === "climbing") s.el.style.opacity = Math.min(1, edge / 0.35 + 0.0001).toFixed(3);
      s.update(lerp(a, b, k), t);
    });
    if (!reduce) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
