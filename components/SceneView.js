"use client";
import { SCENE_OF, SCENES } from "@/lib/scenes";
const spin = { transformBox: "fill-box", transformOrigin: "center" };
const SVG = ({ children }) => <svg viewBox="0 0 400 200" className="w-full max-w-3xl">{children}</svg>;
const lit = (on, c = "#22c55e") => (on ? c : "#334155");

const Garage = ({ t }) => (
  <SVG>
    <rect x="100" y="30" width="200" height="140" fill="#1e293b" stroke="#475569" />
    <rect x="140" y="60" width="120" height="110" fill="#020617" />
    <rect x="140" y="60" width="120" height={110 - t._p * 1.1} fill="#94a3b8" />
    {[1, 2, 3].map((i) => 60 + i * 25 < 170 - t._p * 1.1 && <line key={i} x1="140" x2="260" y1={60 + i * 25} y2={60 + i * 25} stroke="#64748b" strokeWidth="2" />)}
    <text x="200" y="192" textAnchor="middle" fontSize="12" fill="#94a3b8">door {Math.round(t._p)}% open</text>
  </SVG>
);
const Tank = ({ t, mixer }) => {
  const h = 140, y0 = 30, yl = (l) => y0 + h - (h * l) / 100;
  return (
    <SVG>
      <rect x="140" y={y0} width="120" height={h} fill="#020617" stroke="#64748b" strokeWidth="4" />
      <rect x="142" y={yl(t._lv)} width="116" height={(h * t._lv) / 100} fill="#06b6d4" opacity=".8" />
      {[["HIGH", 90], ["MID", 50], ["LOW", mixer ? 10 : 10]].filter(([k]) => k in t).map(([k, l]) => (
        <g key={k}><line x1="260" x2="285" y1={yl(l)} y2={yl(l)} stroke={lit(t[k])} strokeWidth="3" /><text x="290" y={yl(l) + 4} fontSize="11" fill="#94a3b8">{k}</text></g>))}
      <rect x="190" y="6" width="20" height="24" fill={lit(t.FILL || t.VALVE_1)} /><text x="200" y="20" fontSize="9" textAnchor="middle" fill="#020617">IN</text>
      <rect x="120" y={y0 + h - 12} width="20" height="12" fill={lit(t.DRAIN || t.DISCHARGE, "#f59e0b")} />
      {mixer && <g style={spin} className={t.MIXER ? "animate-spin" : ""}><rect x="182" y="100" width="36" height="6" fill="#e2e8f0" /><rect x="197" y="85" width="6" height="36" fill="#e2e8f0" /></g>}
      <text x="200" y="192" textAnchor="middle" fontSize="12" fill="#94a3b8">level {Math.round(t._lv)}%</text>
    </SVG>
  );
};
const Line = ({ t }) => {
  const run = t.M1 || t.M2 || t.M3 || t.MOTOR || t.CONVEYOR_RUN;
  return (
    <SVG>
      <rect x="20" y="120" width="360" height="16" rx="8" fill={run ? "#475569" : "#1e293b"} stroke="#64748b" />
      {[40, 100, 160, 220, 280, 340].map((x) => <g key={x} style={spin} className={run ? "animate-spin" : ""}><circle cx={x} cy="128" r="6" fill="#94a3b8" /><line x1={x - 5} x2={x + 5} y1="128" y2="128" stroke="#0f172a" strokeWidth="2" /></g>)}
      {t._x >= 0 && <rect x={20 + t._x * 3.1} y="92" width="28" height="28" fill="#d97706" stroke="#fbbf24" />}
      {"PS" in t && <g><rect x="318" y="60" width="8" height="40" fill={lit(t.PS, "#fbbf24")} /><text x="322" y="54" fontSize="11" textAnchor="middle" fill="#94a3b8">PS</text></g>}
      {"GATE" in t && <g><rect x="20" y="70" width="10" height={t.GATE ? 14 : 44} fill={lit(t.GATE, "#f59e0b")} /><text x="25" y="62" fontSize="11" textAnchor="middle" fill="#94a3b8">GATE</text></g>}
    </SVG>
  );
};
const Railroad = ({ t }) => (
  <SVG>
    <rect x="0" y="150" width="400" height="30" fill="#1e293b" />
    <rect x="70" y="100" width="14" height="52" fill="#64748b" />
    <g transform={`rotate(${-70 + (70 * t._a) / 100} 77 105)`}>
      <rect x="77" y="100" width="190" height="10" fill="#e5e7eb" />
      {[110, 150, 190, 230].map((x) => <rect key={x} x={x} y="100" width="14" height="10" fill="#ef4444" />)}
    </g>
    <circle cx="55" cy="85" r="11" fill={lit(t.RED_LEFT, "#ef4444")} className={t.RED_LEFT ? "animate-pulse" : ""} />
    <circle cx="99" cy="85" r="11" fill={lit(t.RED_RIGHT, "#ef4444")} className={t.RED_RIGHT ? "animate-pulse" : ""} />
    <text x="320" y="170" fontSize="12" fill="#94a3b8" textAnchor="middle">gate {Math.round(t._a)}% down</text>
  </SVG>
);
const Cylinder = ({ t }) => (
  <SVG>
    <rect x="50" y="80" width="150" height="40" fill="#334155" stroke="#94a3b8" />
    <rect x="200" y="94" width={t._c * 1.2} height="12" fill="#cbd5e1" />
    <rect x={200 + t._c * 1.2} y="70" width="14" height="60" fill="#f59e0b" />
    <line x1="200" x2="200" y1="135" y2="155" stroke={lit(t.LS1)} strokeWidth="4" /><text x="200" y="170" fontSize="11" textAnchor="middle" fill="#94a3b8">LS1</text>
    <line x1="320" x2="320" y1="135" y2="155" stroke={lit(t.LS2)} strokeWidth="4" /><text x="320" y="170" fontSize="11" textAnchor="middle" fill="#94a3b8">LS2</text>
  </SVG>
);
const Compressor = ({ t }) => (
  <SVG>
    <rect x="130" y="60" width="160" height="90" rx="40" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
    <rect x="136" y="66" width={(148 * t._psi) / 100} height="78" rx="36" fill="#38bdf8" opacity=".45" />
    <text x="210" y="112" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#e2e8f0">{Math.round(t._psi)} psi</text>
    <circle cx="70" cy="105" r="26" fill="#334155" stroke={lit(t.MOTOR)} strokeWidth="3" />
    <g style={spin} className={t.MOTOR ? "animate-spin" : ""}><rect x="50" y="102" width="40" height="6" fill="#e2e8f0" /><rect x="67" y="85" width="6" height="40" fill="#e2e8f0" /></g>
    <text x="70" y="150" textAnchor="middle" fontSize="11" fill="#94a3b8">MOTOR</text>
    <circle cx="340" cy="105" r="16" fill={lit(t.VALVE, "#f59e0b")} /><text x="340" y="140" textAnchor="middle" fontSize="11" fill="#94a3b8">VENT VALVE</text>
  </SVG>
);
const Pick = ({ t }) => {
  const tip = 40 + t._d * 0.9;
  return (
    <SVG>
      <rect x="0" y="170" width="400" height="14" fill="#475569" />
      <rect x="185" y="8" width="30" height="32" fill="#64748b" />
      <rect x="196" y="40" width="8" height={t._d * 0.9} fill="#cbd5e1" />
      <rect x="184" y={tip} width="32" height="8" fill={lit(t.VACUUM)} />
      <rect x="180" y={t._h ? tip + 8 : 142} width="40" height="28" fill="#d97706" stroke="#fbbf24" />
      <text x="250" y="60" fontSize="11" fill={t.EXT ? "#22c55e" : "#94a3b8"}>EXT {t.EXT ? "●" : "○"}</text>
    </SVG>
  );
};
const Poles = ({ t, cfg }) => (
  <div className="flex flex-wrap justify-center gap-10 py-2">
    {cfg.groups.map((g) => (
      <div key={g.t} className="text-center">
        <div className="mb-2 text-xs text-slate-400">{g.t}</div>
        <div className="inline-flex flex-col gap-2 rounded-2xl border-4 border-slate-600 bg-slate-950 p-3">
          {g.lamps.map(([k, c]) => <div key={k} title={k} className="h-12 w-12 rounded-full" style={{ background: t[k] ? c : "#1e293b", boxShadow: t[k] ? `0 0 24px ${c}` : "none" }} />)}
        </div>
      </div>
    ))}
  </div>
);
const Motor = ({ t }) => (
  <SVG>
    <rect x="90" y="70" width="170" height="70" rx="12" fill="#334155" stroke="#94a3b8" strokeWidth="3" />
    {[110, 130, 150, 170, 190, 210, 230].map((x) => <line key={x} x1={x} x2={x} y1="78" y2="132" stroke="#64748b" strokeWidth="3" />)}
    <rect x="130" y="140" width="90" height="14" fill="#475569" />
    <rect x="260" y="98" width="56" height="14" fill="#cbd5e1" />
    <g style={spin} className={t.MOTOR ? "animate-spin" : ""}><circle cx="340" cy="105" r="26" fill="#475569" stroke="#e2e8f0" strokeWidth="3" /><rect x="316" y="102" width="48" height="6" fill="#e2e8f0" /><rect x="337" y="81" width="6" height="48" fill="#e2e8f0" /></g>
    <circle cx="55" cy="105" r="13" fill={lit(t.MOTOR)} /><text x="55" y="138" textAnchor="middle" fontSize="12" fill="#94a3b8">{t.MOTOR ? "RUNNING" : "STOPPED"}</text>
  </SVG>
);
const TankV = ({ t }) => {
  const h = 140, y0 = 30, lv = Math.max(0, Math.min(100, t.TANK_LEVEL || 0));
  return (
    <SVG>
      <rect x="140" y={y0} width="120" height={h} fill="#020617" stroke="#64748b" strokeWidth="4" />
      <rect x="142" y={y0 + h - (h * lv) / 100} width="116" height={(h * lv) / 100} fill="#06b6d4" opacity=".8" />
      <rect x="190" y="6" width="20" height="24" fill={lit(t.VALVE)} /><text x="200" y="20" fontSize="9" textAnchor="middle" fill="#020617">IN</text>
      {"MOTOR" in t && <g style={spin} className={t.MOTOR ? "animate-spin" : ""}><rect x="182" y="100" width="36" height="6" fill="#e2e8f0" /><rect x="197" y="85" width="6" height="36" fill="#e2e8f0" /></g>}
      <text x="200" y="192" textAnchor="middle" fontSize="12" fill="#94a3b8">level {Math.round(lv)}%</text>
    </SVG>
  );
};
const Bottling = ({ t }) => (
  <SVG>
    <rect x="10" y="120" width="380" height="12" rx="6" fill="#475569" />
    {t._b.map(([x, l], i) => <g key={i}><rect x={10 + x * 3.6} y="84" width="14" height="36" rx="3" fill="#0f172a" stroke="#94a3b8" /><rect x={11 + x * 3.6} y={120 - 0.34 * l} width="12" height={0.34 * l} fill="#f59e0b" /></g>)}
    <rect x="148" y="30" width="14" height="36" fill="#64748b" /><rect x="152" y="66" width="6" height="14" fill={lit(t.FILL_V, "#f59e0b")} />
    <rect x="338" y="92" width="52" height="38" fill="none" stroke={lit(t.CRATE_OUT, "#22c55e")} strokeWidth="3" />
    {Array.from({ length: t._n }, (_, i) => <rect key={i} x={342 + (i % 3) * 16} y={96 + Math.floor(i / 3) * 16} width="12" height="12" fill="#f59e0b" />)}
    <text x="200" y="190" textAnchor="middle" fontSize="12" fill="#94a3b8">crate {t._n}/6</text>
  </SVG>
);
const mixc = (t) => { const w = t._w + t._r + t._bl + t._y; if (!w) return "#e5e7eb"; const c = [[t._w, 245, 245, 245], [t._r, 220, 40, 40], [t._bl, 40, 90, 210], [t._y, 245, 200, 30]]; const m = (i) => Math.round(c.reduce((a, r) => a + r[0] * r[i], 0) / w); return `rgb(${m(1)},${m(2)},${m(3)})`; };
const TARGET = { 1: ["#f08c1e", "Orange"], 2: ["#3caa50", "Green"], 3: ["#823caa", "Purple"] };
const Paint = ({ t }) => {
  const h = 140, y0 = 30, lv = t._lv, tg = TARGET[t.RECIPE] || ["#444", "?"];
  return (
    <SVG>
      <rect x="130" y={y0} width="140" height={h} fill="#020617" stroke="#64748b" strokeWidth="4" />
      <rect x="132" y={y0 + h - (h * lv) / 100} width="136" height={(h * lv) / 100} fill={mixc(t)} />
      {[["L2", 50], ["L3", 75], ["L4", 100]].map(([k, l]) => <line key={k} x1="270" x2="290" y1={y0 + h - (h * l) / 100 + 1} y2={y0 + h - (h * l) / 100 + 1} stroke={lit(t[k])} strokeWidth="3" />)}
      {[["V_BASE", 140, "#e5e7eb"], ["V_RED", 170, "#dc2828"], ["V_BLUE", 200, "#2858d2"], ["V_YELLOW", 230, "#f5c81e"]].map(([k, x, c]) => <rect key={k} x={x} y="6" width="18" height="22" fill={lit(t[k], c)} />)}
      <g style={spin} className={t.MIXER ? "animate-spin" : ""}><rect x="180" y="100" width="40" height="6" fill="#e2e8f0" /><rect x="197" y="83" width="6" height="40" fill="#e2e8f0" /></g>
      <rect x="115" y="164" width="16" height="10" fill={lit(t.V_OUT, "#38bdf8")} />
      <rect x="320" y="60" width="50" height="50" fill={tg[0]} stroke="#e2e8f0" /><text x="345" y="130" textAnchor="middle" fontSize="11" fill="#94a3b8">target: {tg[1]}</text>
    </SVG>
  );
};
const Dairy = ({ t }) => {
  const hot = Math.min(1, Math.max(0, (t.TEMP - 20) / 60)), pipe = t.DIVERT ? "#e2e8f0" : "#334155";
  return (
    <SVG>
      <rect x="20" y="70" width="60" height="70" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" /><text x="50" y="160" textAnchor="middle" fontSize="11" fill="#94a3b8">raw milk</text>
      <line x1="80" y1="105" x2="140" y2="105" stroke={t.PUMP ? "#e2e8f0" : "#475569"} strokeWidth="6" />
      <rect x="140" y="70" width="110" height="70" fill={`rgb(${Math.round(60 + 190 * hot)},60,60)`} stroke={lit(t.HEATER, "#ef4444")} strokeWidth="4" /><text x="195" y="112" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#fff">{Math.round(t.TEMP)}°C</text>
      <line x1="250" y1="105" x2={t.DIVERT ? 270 : 330} y2="105" stroke="#e2e8f0" strokeWidth="6" />
      <polyline points="270,105 270,30 50,30 50,70" fill="none" stroke={pipe} strokeWidth="6" />
      <rect x="330" y="85" width="50" height="40" fill={t.DIVERT ? "#1e293b" : "#22c55e"} /><text x="355" y="145" textAnchor="middle" fontSize="11" fill="#94a3b8">packing</text>
      {t.ALARM && <text x="200" y="190" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ef4444">OVERTEMP ALARM</text>}
    </SVG>
  );
};
const Pumps = ({ t }) => {
  const h = 120, lv = t._lv;
  return (
    <SVG>
      <rect x="150" y="30" width="100" height={h} fill="#020617" stroke="#64748b" strokeWidth="4" /><rect x="152" y={30 + h - (h * lv) / 100} width="96" height={(h * lv) / 100} fill="#06b6d4" opacity=".8" />
      <text x="200" y="182" textAnchor="middle" fontSize="12" fill="#94a3b8">level {Math.round(lv)}%</text>
      {[["PUMP1", 70, "OK1"], ["PUMP2", 330, "OK2"]].map(([k, x, ok]) => (
        <g key={k}><circle cx={x} cy="120" r="28" fill="#334155" stroke={!t[ok] ? "#ef4444" : lit(t[k])} strokeWidth="4" />
          <g style={spin} className={t[k] ? "animate-spin" : ""}><rect x={x - 20} y="117" width="40" height="6" fill="#e2e8f0" /><rect x={x - 3} y="100" width="6" height="40" fill="#e2e8f0" /></g>
          <text x={x} y="165" textAnchor="middle" fontSize="11" fill={!t[ok] ? "#ef4444" : "#94a3b8"}>{k}{!t[ok] ? " FAULT" : ""}</text></g>))}
      <rect x="175" y="6" width="50" height="16" fill={lit(t.DOSE, "#a3e635")} /><text x="200" y="18" textAnchor="middle" fontSize="9" fill="#020617">CHLORINE</text>
    </SVG>
  );
};
const Lift = ({ t }) => {
  const y = 150 - t._h * 0.65;
  return (
    <SVG>
      <rect x="140" y="14" width="120" height="176" fill="#0f172a" stroke="#475569" strokeWidth="3" />
      {[["3", 20], ["2", 85], ["1", 150]].map(([n, fy]) => <g key={n}><line x1="130" x2="270" y1={fy + 40} y2={fy + 40} stroke="#334155" /><text x="105" y={fy + 28} fontSize="14" fill="#94a3b8">F{n}</text></g>)}
      <rect x="160" y={y} width="80" height="38" fill="#475569" stroke="#e2e8f0" strokeWidth="2" />
      <rect x="160" y={y} width={40 - t._d * 0.35} height="38" fill="#94a3b8" /><rect x={200 + t._d * 0.35} y={y} width={40 - t._d * 0.35} height="38" fill="#94a3b8" />
      <text x="290" y="100" fontSize="13" fill="#94a3b8">{t.UP ? "▲ up" : t.DOWN ? "▼ down" : "stopped"}</text>
    </SVG>
  );
};
const VIEW = { bottling: Bottling, paint: Paint, dairy: Dairy, pumps: Pumps, lift: Lift, motor: Motor, tankv: TankV, garage: Garage, tank: Tank, mixer: (p) => <Tank {...p} mixer />, line: Line, railroad: Railroad, cylinder: Cylinder, compressor: Compressor, pick: Pick };

function Btn({ k, nc, tog, t, setT }) {
  if (tog) return <button onClick={() => setT((p) => ({ ...p, [k]: !p[k] }))} className={`rounded px-4 py-2 text-sm font-bold ${t[k] ? "bg-emerald-600" : "bg-slate-700"}`}>{k} = {t[k] ? 1 : 0}</button>;
  const press = !nc, rel = () => setTimeout(() => setT((p) => ({ ...p, [k]: nc })), 200);
  return <button onPointerDown={() => setT((p) => ({ ...p, [k]: press }))} onPointerUp={rel}
    className={`select-none rounded px-4 py-2 text-sm font-bold ${nc ? "bg-red-700" : "bg-emerald-700"} ${t[k] === press ? "ring-2 ring-white" : ""}`}>{k}{nc ? " (NC)" : ""}</button>;
}
const Pill = ({ k, on }) => <span className={`rounded px-2 py-1 ${on ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"}`}>{k} {on ? 1 : 0}</span>;

export default function SceneView({ prob, t, setT }) {
  const cfg = SCENE_OF[prob.id] || { type: "poles", groups: [{ t: "Outputs", lamps: prob.outputs.map((o) => [o, "#22c55e"]) }] };
  const sensors = SCENES[cfg.type]?.sensors || [];
  const V = VIEW[cfg.type];
  return (
    <div className="space-y-3">
      <div className="flex justify-center rounded-xl border border-slate-800 bg-slate-950 p-3">{V ? <V t={t} /> : <Poles t={t} cfg={cfg} />}</div>
      <div className="flex flex-wrap items-center gap-2">
        {prob.inputs.filter((k) => !sensors.includes(k) && typeof prob.tags[k] === "boolean").map((k) => <Btn key={k} k={k} nc={prob.tags[k] === true} tog={cfg.toggles?.includes(k)} t={t} setT={setT} />)}
        {prob.inputs.filter((k) => typeof prob.tags[k] === "number").map((k) => <label key={k} className="flex items-center gap-2 text-xs">{k} <input type="range" min={cfg.ranges?.[k]?.[0] ?? 0} max={cfg.ranges?.[k]?.[1] ?? 100} value={t[k]} onChange={(e) => setT((p) => ({ ...p, [k]: Number(e.target.value) }))} /> {Math.round(t[k])}</label>)}
        {prob.inputs.filter((k) => typeof prob.tags[k] === "string").map((k) => <button key={k} className="btn2" onClick={() => setT((p) => ({ ...p, [k]: p[k] === "AUTO" ? "MANUAL" : "AUTO" }))}>{k}: {t[k]}</button>)}
        {(cfg.actions || []).map(([l, v]) => <button key={l} className="btn2" onClick={() => setT((p) => ({ ...p, ...v }))}>{l}</button>)}
      </div>
      <div className="flex flex-wrap gap-2 font-mono text-xs">{sensors.map((k) => <Pill key={k} k={k} on={t[k]} />)}{prob.outputs.map((k) => <Pill key={k} k={k} on={t[k]} />)}</div>
      {V && <p className="text-xs text-slate-500">Sensors and limit switches update by themselves while the PLC is running. Use the buttons above as the operator.</p>}
    </div>
  );
}
