export const BASE = { START: false, STOP: true, ESTOP: true, MODE: "AUTO", MANUAL_VALVE: false,
  MOTOR: false, VALVE: false, CONVEYOR_RUN: false, SENSOR_BOX: false,
  TANK_LEVEL: 15, BOX_POS: 0, COUNTER_VAL: 0 };
export const ADDR = { START: "%I0.0", STOP: "%I0.1", ESTOP: "%I0.2", SENSOR_BOX: "%I0.3", MANUAL_VALVE: "%I0.4",
  MOTOR: "%Q0.0", VALVE: "%Q0.1", CONVEYOR_RUN: "%Q0.2", MODE: "%M0.0", TANK_LEVEL: "%MD10", BOX_POS: "%MD14", COUNTER_VAL: "%MW20" };
export const GROUPS = [["Inputs", ["START", "STOP", "ESTOP", "SENSOR_BOX", "MANUAL_VALVE"]],
  ["Outputs", ["MOTOR", "VALVE", "CONVEYOR_RUN"]], ["Memory", ["MODE", "TANK_LEVEL", "BOX_POS", "COUNTER_VAL"]]];
const no = (tag) => ({ k: "NO", tag });
const cmp = (tag, op, val) => ({ k: "CMP", tag, op, val });
export const PRESETS = {
  tank: { name: "Water Tank TK-101", info: "Inlet valve VALVE fills the tank, agitator MOTOR mixes. START/STOP/E-STOP are pushbuttons (STOP and E-STOP are normally closed: 1 = healthy). Tank drains 0.8%/scan, fills 2%/scan when VALVE is open.", rungs: [
    { out: "MOTOR", c: "Agitator start/stop with seal-in", series: [{ k: "BR", paths: [[no("START")], [no("MOTOR")]] }, no("STOP"), no("ESTOP")] },
    { out: "VALVE", c: "Inlet valve", series: [no("ESTOP"), { k: "BR", paths: [[cmp("MODE", "==", "AUTO"), cmp("TANK_LEVEL", "<", 80)], [cmp("MODE", "==", "MANUAL"), no("MANUAL_VALVE")]] }] },
  ] },
  conveyor: { name: "Conveyor & Counter", info: "A box rides the conveyor past SENSOR_BOX; COUNTER_VAL counts boxes. START/STOP/E-STOP as on the tank line.", rungs: [
    { out: "CONVEYOR_RUN", c: "Conveyor start/stop with seal-in", series: [{ k: "BR", paths: [[no("START")], [no("CONVEYOR_RUN")]] }, no("STOP"), no("ESTOP")] },
  ] },
};
export const SAFE = /^[\w\s&|!()<>=']+$/;
const RESERVED = new Set("if for do in of new var let const class true false null this return function with switch case default else while delete typeof void try catch finally throw break continue yield await enum export import super static interface package private protected public implements arguments eval undefined NaN Infinity".split(" "));
export const validName = (n) => /^[A-Za-z_]\w{0,23}$/.test(n) && !RESERVED.has(n) && n[0] !== "_";
const term = (i) => (i.inv ? "!" : "") + i.tag;
// contacts: NO, NC, P (rising edge), N (falling edge), CMP (compare with a value or another tag)
const ct = (e) => e.k === "NC" ? "!" + e.tag : e.k === "P" ? "_r_" + e.tag : e.k === "N" ? "_f_" + e.tag
  : e.k === "CMP" ? `${e.tag} ${e.op} ${e.vk === "tag" ? String(e.val).replace(/\W/g, "") : isNaN(e.val) || e.val === "" ? `'${String(e.val).replace(/\W/g, "")}'` : Number(e.val)}` : e.tag;
const cs = (s) => s.length ? s.map((i) => i.k === "BR" ? "(" + i.paths.map(cs).join(" || ") + ")" : ct(i)).join(" && ") : "true";
export function compile(r) {
  if (r.series) return r.series.length ? cs(r.series) : "false";
  if (r.fbd) {
    const { block, ins } = r.fbd;
    if (!ins.length) return "false";
    if (block === "AND") return ins.map(term).join(" && ");
    if (block === "OR") return ins.map(term).join(" || ");
    if (block === "NOT") return "!" + ins[0].tag;
    return ins.length < 2 ? "false" : `(${term(ins[0])} || ${r.out}) && !(${term(ins[1])})`;
  }
  if (r.rows) { const rows = r.rows.filter((x) => x.length); return rows.length ? rows.map((row) => "(" + row.map(ct).join(" && ") + ")").join(" || ") : "false"; }
  return r.expr || "false";
}
export const norm = (rs) => rs.map((r) => r.rows ? { out: r.out, c: r.c, series: (() => { const x = r.rows.filter((a) => a.length); return x.length > 1 ? [{ k: "BR", paths: x }] : x[0] || []; })() } : r);
export function ev(expr, t) {
  const toks = String(expr).match(/\d+(?:\.\d+)?|[A-Za-z_]\w*|'[^']*'|&&|\|\||==|!=|<=|>=|[!<>()]|\S/g) || [];
  let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  const prim = () => {
    const x = next();
    if (x === undefined) throw 0;
    if (x === "(") { const v = or(); if (next() !== ")") throw 0; return v; }
    if (x === "!") return !prim();
    if (/^\d/.test(x)) return Number(x);
    if (x[0] === "'") return x.slice(1, -1);
    if (x === "true") return true;
    if (x === "false") return false;
    if (/^[A-Za-z_]/.test(x)) return Object.prototype.hasOwnProperty.call(t, x) ? t[x] : undefined;
    throw 0;
  };
  const OPS = ["==", "!=", "<", "<=", ">", ">="];
  const cmp = () => { let a = prim(); while (OPS.includes(peek())) { const o = next(), b = prim(); a = o === "==" ? a == b : o === "!=" ? a != b : o === "<" ? a < b : o === "<=" ? a <= b : o === ">" ? a > b : a >= b; } return a; };
  const and = () => { let a = cmp(); while (peek() === "&&") { next(); const b = cmp(); a = a && b; } return a; };
  const or = () => { let a = and(); while (peek() === "||") { next(); const b = and(); a = a || b; } return a; };
  try { const v = or(); return i < toks.length ? false : !!v; } catch { return false; }
}
// data a block creates (so contacts / compares / math can use it before the PLC has run)
export const deriveTags = (rs) => [...new Set(rs.flatMap((r) => r.kind === "MATH" ? (r.dest ? [r.dest] : [])
  : ["TON", "TOF", "TP"].includes(r.kind) ? [r.inst + "_Q", r.inst + "_ET"] : ["CTU", "CTD"].includes(r.kind) ? [r.inst + "_Q", r.inst + "_CV"] : []))];
// a new network for a palette block
export function mkBlock(id, rs, out = "MOTOR") {
  const n = (pre) => { let i = 1; while (rs.some((r) => r.inst === pre + i)) i++; return pre + i; };
  if (["TON", "TOF", "TP"].includes(id)) return { kind: id, inst: n("T"), pt: 2000, series: [], c: "" };
  if (["CTU", "CTD"].includes(id)) return { kind: id, inst: n("C"), pv: 5, series: [], c: "" };
  if (id === "CRES") return { kind: "CRES", inst: rs.find((r) => r.kind === "CTU" || r.kind === "CTD")?.inst || "C1", series: [], c: "" };
  if (["ADD", "SUB", "MUL", "DIV"].includes(id)) return { kind: "MATH", op: id, a: "0", b: "0", dest: "", dt: "Int", series: [], c: "" };
  return { out, coil: id, series: [], c: "" };
}
const opd = (t, x) => (x === "" || x == null ? 0 : isNaN(x) ? Number(t[x]) || 0 : Number(x));
function block(t, r, IN, dt) {
  const i = r.inst, Q = i + "_Q", ET = i + "_ET", CV = i + "_CV", pt = Number(r.pt) || 0, pv = Number(r.pv) || 0, inn = "_" + i + "_in", run = "_" + i + "_run";
  if (r.kind === "TON") { t[ET] = IN ? Math.min(t[ET] + dt, pt) : 0; t[Q] = IN && t[ET] >= pt; }
  else if (r.kind === "TOF") { if (IN) { t[Q] = true; t[ET] = 0; } else if (t[Q]) { t[ET] = Math.min(t[ET] + dt, pt); if (t[ET] >= pt) t[Q] = false; } }
  else if (r.kind === "TP") {
    if (IN && !t[inn] && !t[run]) { t[run] = true; t[ET] = 0; }
    if (t[run]) { t[ET] = Math.min(t[ET] + dt, pt); if (t[ET] >= pt) t[run] = false; } else if (!IN) t[ET] = 0;
    t[Q] = !!t[run];
  } else { t["_" + i + "_pv"] = pv; t["_" + i + "_ty"] = r.kind; if (IN && !t[inn]) t[CV] += r.kind === "CTU" ? 1 : -1; t[Q] = r.kind === "CTU" ? t[CV] >= pv : t[CV] <= 0; }
  t[inn] = IN;
}
export function scan(p, rungs, preset, dt = 100) {
  const t = { ...p }, prev = p._prev || {};
  for (const k of Object.keys(p)) if (k[0] !== "_" && typeof p[k] === "boolean") { t["_r_" + k] = p[k] && !prev[k]; t["_f_" + k] = !p[k] && !!prev[k]; }
  for (const r of rungs) {
    if (r.kind === "MATH") { if (r.dest) t[r.dest] ??= 0; }
    else if (["TON", "TOF", "TP"].includes(r.kind)) { t[r.inst + "_Q"] ??= false; t[r.inst + "_ET"] ??= 0; }
    else if (["CTU", "CTD"].includes(r.kind)) { t[r.inst + "_Q"] ??= false; t[r.inst + "_CV"] ??= r.kind === "CTD" ? Number(r.pv) || 0 : 0; }
  }
  const on = (r) => ev(compile(r), t);
  for (const r of rungs) {
    if (!r.kind) {
      const v = on(r);
      if (r.coil === "SET") { if (v) t[r.out] = true; } else if (r.coil === "RESET") { if (v) t[r.out] = false; } else t[r.out] = v;
    } else if (r.kind === "MATH") {
      if (on(r) && r.dest) {
        const a = opd(t, r.a), b = opd(t, r.b), v = r.op === "ADD" ? a + b : r.op === "SUB" ? a - b : r.op === "MUL" ? a * b : b === 0 ? null : a / b;
        if (v !== null) t[r.dest] = r.dt === "Real" ? v : Math.trunc(v);
      }
    } else if (r.kind !== "CRES") block(t, r, on(r), dt);
  }
  for (const r of rungs) if (r.kind === "CRES" && on(r)) {   // reset (CTU -> 0) / load (CTD -> PV) always wins
    const i = r.inst, ty = t["_" + i + "_ty"], pv = t["_" + i + "_pv"] || 0;
    t[i + "_CV"] = ty === "CTD" ? pv : 0; t[i + "_Q"] = ty === "CTD" ? t[i + "_CV"] <= 0 : t[i + "_CV"] >= pv;
  }
  if (preset === "tank") {
    t.TANK_LEVEL = Math.round(Math.max(0, Math.min(100, t.TANK_LEVEL + (t.VALVE ? 2 : 0) - 0.8)) * 10) / 10;
  } else if (preset === "conveyor") {
    if (t.CONVEYOR_RUN) t.BOX_POS = (t.BOX_POS + 4) % 100;
    t.SENSOR_BOX = t.BOX_POS >= 48 && t.BOX_POS < 56;
    if (t.SENSOR_BOX && !p.SENSOR_BOX) t.COUNTER_VAL += 1;
  }
  t._prev = Object.fromEntries(Object.keys(t).filter((k) => k[0] !== "_" && typeof t[k] === "boolean").map((k) => [k, t[k]]));
  return t;
}
// test step = [label, inputs, expected, scans (default 2; 10 scans = 1 s)]
export function runTests(rungs, preset, tests, base = BASE) {
  let t = { ...base };
  return tests.map(([label, set, expect, scans]) => {
    t = { ...t, ...set };
    for (let i = 0; i < (scans || 2); i++) t = scan(t, rungs, preset);
    const bad = Object.entries(expect).filter(([k, v]) => t[k] !== v);
    return { label, ok: !bad.length, got: bad.map(([k, v]) => `${k}=${t[k]} (want ${v})`).join(", ") };
  });
}
