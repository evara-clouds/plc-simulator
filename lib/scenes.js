import { BASE } from "./sim";
const cl = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const put = (t, k, v) => { if (k in t) t[k] = v; };   // set a sensor only if the problem has it
const R = "#ef4444", Y = "#facc15", G = "#22c55e", B = "#3b82f6";
const TL = [["RED", R], ["YELLOW", Y], ["GREEN", G]];

// Physics: runs once per PLC scan. Hidden state lives in tags starting with "_".
export const SCENES = {
  garage: { init: { _p: 0, DOWN: true }, sensors: ["UP", "DOWN"], step(t) {
    if (t.FWD && !t.REV) t._p = cl(t._p + 4); if (t.REV && !t.FWD) t._p = cl(t._p - 4);
    put(t, "UP", t._p >= 100); put(t, "DOWN", t._p <= 0); } },
  tank: { init: { _lv: 50 }, sensors: ["HIGH", "LOW"], step(t) {
    t._lv = cl(t._lv + (t.FILL ? 2 : 0) - (t.DRAIN ? 2 : 0)); put(t, "HIGH", t._lv >= 90); put(t, "LOW", t._lv <= 10); } },
  mixer: { init: { _lv: 0 }, sensors: ["HIGH", "MID", "LOW"], step(t) {
    t._lv = cl(t._lv + (t.VALVE_1 && t.VALVE_2 ? 3 : 0) - (t.DISCHARGE ? 3 : 0));
    put(t, "HIGH", t._lv >= 90); put(t, "MID", t._lv >= 50); put(t, "LOW", t._lv > 10); } },
  line: { init: { _x: -1 }, sensors: ["PS"], step(t) {
    const run = t.M1 || t.M2 || t.M3 || t.MOTOR, feed = "GATE" in t ? t.GATE : t.MOTOR;
    if (t._x < 0 && feed) t._x = 0;
    else if (run && t._x >= 0) { t._x += 3; if (t._x > 110) t._x = -1; }
    put(t, "PS", t._x >= 88 && t._x <= 100); } },
  railroad: { init: { _a: 0, UP: true }, sensors: ["UP", "DOWN"], step(t) {
    if (t.FWD && !t.REV) t._a = cl(t._a + 3); if (t.REV && !t.FWD) t._a = cl(t._a - 3);
    put(t, "DOWN", t._a >= 100); put(t, "UP", t._a <= 0); } },
  cylinder: { init: { _c: 0, LS1: true }, sensors: ["LS1", "LS2"], step(t) {
    if (t.SOL_A && !t.SOL_B) t._c = cl(t._c + 3); if (t.SOL_B && !t.SOL_A) t._c = cl(t._c - 3);
    put(t, "LS2", t._c >= 100); put(t, "LS1", t._c <= 0); } },
  compressor: { init: { _psi: 0 }, sensors: ["HIGH"], step(t) {
    t._psi = cl(t._psi + (t.MOTOR ? 2 : 0) - (t.VALVE ? 4 : 0) - 0.2); put(t, "HIGH", !(t._psi >= 80)); } },   // HIGH is normally closed
  pick: { init: { _d: 0, _h: 0 }, sensors: ["EXT"], step(t) {
    t._d = cl(t._d + (t.DOWN ? 5 : -5)); put(t, "EXT", t._d >= 100);
    if (!t.VACUUM) t._h = 0; else if (t._d >= 100) t._h = 1; } },
  poles: { init: {}, sensors: [], step() {} },
};

export const SCENE_OF = {
  b1: { type: "line" }, b2: { type: "tank" }, b3: { type: "garage" }, b6: { type: "garage" }, b7: { type: "tank" },
  b4: { type: "poles", groups: [{ t: "Traffic light", lamps: TL }] }, b5: { type: "poles", groups: [{ t: "Traffic light", lamps: TL }] },
  b8: { type: "compressor" }, b9: { type: "poles", groups: [{ t: "Lamp", lamps: [["LAMP1", Y]] }] },
  b10: { type: "poles", groups: [{ t: "Stack light", lamps: [...TL, ["BLUE", B]] }] },
  b11: { type: "line", actions: [["Remove package", { _x: -1 }]] }, b12: { type: "pick", actions: [["Reset package", { _h: 0, _d: 0 }]] },
  b13: { type: "poles", groups: [{ t: "Traffic light", lamps: TL }], toggles: ["BIT0", "BIT1"] },
  b14: { type: "railroad" }, b15: { type: "cylinder" }, b16: { type: "mixer" },
  t1: { type: "poles", groups: [{ t: "North–South", lamps: [["NS_RED", R], ["NS_GREEN", G]] }, { t: "East–West", lamps: [["EW_RED", R], ["EW_GREEN", G]] }] },
  t2: { type: "poles", groups: [{ t: "Cars", lamps: [["CAR_RED", R], ["CAR_GREEN", G]] }, { t: "Pedestrians", lamps: [["DONT_WALK", R], ["WALK", G]] }] },
};
export const stepScene = (t, cfg) => { const d = cfg && SCENES[cfg.type]; if (!d) return t; const x = { ...t }; d.step(x); return x; };
export const initTags = (p) => (p?.tags ? { ...p.tags, ...(SCENES[SCENE_OF[p.id]?.type]?.init || {}) } : BASE);
