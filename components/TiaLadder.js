"use client";
import { useState } from "react";
import { BASE, ADDR, compile, ev } from "@/lib/sim";

const TAGS = Object.keys(BASE), COILS = ["MOTOR", "VALVE", "CONVEYOR_RUN"], OPS = ["==", "!=", "<", "<=", ">", ">="];
const CW = 64, RH = 64, SW = 22; // contact width, row height, slot width
const mSer = (s) => { const m = s.map((i) => (i.k === "BR" ? mBr(i) : { w: CW, h: 1 })); return { w: m.reduce((a, c) => a + c.w, SW * (s.length + 1)), h: Math.max(1, ...m.map((a) => a.h)) }; };
const mBr = (b) => { const m = b.paths.map(mSer); return { w: Math.max(...m.map((a) => a.w)), h: m.reduce((a, c) => a + c.h, 0) }; };
const getS = (s, addr) => addr.reduce((x, [i, k]) => x[i].paths[k], s);
const clone = (x) => JSON.parse(JSON.stringify(x));
const Sel = ({ v, o, f }) => (
  <select value={v} onChange={(e) => f(e.target.value)} className="rounded border border-gray-400 bg-white px-1 py-0.5 text-xs text-black">
    {o.map((x) => <option key={x}>{x}</option>)}
  </select>
);

const BLOCKS = new Set(["TON", "TOF", "TP", "CTU", "CTD", "CRES", "ADD", "SUB", "MUL", "DIV", "OUT", "SET", "RESET"]);
const GROUPS = [
  ["Favorites", [["NO", "Normally open contact", "┤ ├"], ["NC", "Normally closed contact", "┤/├"], ["BR", "Open branch", "┬"], ["TON", "TON on-delay timer", "TON"], ["CTU", "CTU count up", "CTU"]]],
  ["Bit logic operations", [["NO", "Normally open contact", "┤ ├"], ["NC", "Normally closed contact", "┤/├"], ["P", "Positive edge contact", "┤P├"], ["N", "Negative edge contact", "┤N├"], ["OUT", "Assign output coil", "( )"], ["SET", "Set output coil", "(S)"], ["RESET", "Reset output coil", "(R)"]]],
  ["Timer operations", [["TON", "TON on-delay", "TON"], ["TOF", "TOF off-delay", "TOF"], ["TP", "TP pulse", "TP"]]],
  ["Counter operations", [["CTU", "CTU count up", "CTU"], ["CTD", "CTD count down", "CTD"], ["CRES", "Reset / load counter", "RES"]]],
  ["Comparator operations", [["CMP", "Compare (==, <, >, …)", "[ ? ]"]]],
  ["Math functions", [["ADD", "ADD", "+"], ["SUB", "SUB", "−"], ["MUL", "MUL", "×"], ["DIV", "DIV", "÷"]]],
  ["General", [["BR", "Open branch", "┬"]]],
];
export function Instructions({ armed, setArmed, onAdd }) {
  const [closed, setClosed] = useState({});
  return (
    <div className="rounded border border-slate-700 bg-slate-900 text-xs">
      <div className="border-b border-slate-700 bg-slate-800 px-2 py-1.5 font-semibold">Instructions</div>
      <p className="px-2 py-1.5 text-[11px] text-slate-400">Contacts and branches: select, then click a blue <b>+</b> slot on a wire. Timers, counters, math and coils are added as new networks.</p>
      {GROUPS.map(([g, items]) => (
        <div key={g}>
          <button onClick={() => setClosed({ ...closed, [g]: !closed[g] })} className="w-full bg-slate-800/60 px-2 py-1 text-left font-semibold">{closed[g] ? "▸" : "▾"} {g}</button>
          {!closed[g] && items.map(([id, label, sym]) => (
            <button key={g + id} onClick={() => (BLOCKS.has(id) ? onAdd && onAdd(id) : setArmed(armed === id ? null : id))}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-800 ${armed === id ? "bg-cyan-900/60 text-cyan-200" : ""}`}>
              <span className="w-9 font-mono">{sym}</span><span>{label}</span>
            </button>))}
        </div>))}
    </div>
  );
}

export default function Ladder({ rungs, setRungs, state, armed, setArmed, coil = "MOTOR", names, coils }) {
  const [sel, setSel] = useState(null);
  const nets = rungs.map((r, j) => [r, j]).filter(([r]) => !r.fbd);
  const edit = (j, fn) => setRungs(rungs.map((r, k) => { if (k !== j) return r; const c = clone(r); fn(c); return c; }));
  const place = (j, addr, i) => {
    if (!armed) return;
    edit(j, (r) => getS(r.series, addr).splice(i, 0,
      armed === "BR" ? { k: "BR", paths: [[], []] } : armed === "CMP" ? { k: "CMP", tag: names?.[0] || "TANK_LEVEL", op: "<", val: 50 } : { k: armed, tag: names?.[0] || "START" }));
    setArmed(null);
  };
  let cur = null;
  try { if (sel) cur = sel.coil ? rungs[sel.j] : getS(rungs[sel.j].series, sel.addr)[sel.i]; } catch { cur = null; }
  const upd = (p) => edit(sel.j, (r) => Object.assign(getS(r.series, sel.addr)[sel.i], p));
  const del = () => { edit(sel.j, (r) => getS(r.series, sel.addr).splice(sel.i, 1)); setSel(null); };

  function draw(r, j) {
    const els = []; let n = 0; const K = () => n++;
    const col = (on) => (on ? "#16a34a" : "#2563eb");
    const wire = (x1, x2, y, on) => els.push(<line key={K()} x1={x1} x2={x2} y1={y} y2={y} stroke={col(on)} strokeWidth="2" strokeDasharray={on ? undefined : "5 4"} />);
    const vbar = (x, y1, y2, on) => els.push(<line key={K()} x1={x} x2={x} y1={y1} y2={y2} stroke={col(on)} strokeWidth="2" />);
    const txt = (x, y, s, c = "#1d4ed8", w = "bold", z = 11) => els.push(<text key={K()} x={x} y={y} textAnchor="middle" fontSize={z} fontWeight={w} fill={c}>{s}</text>);

    function ser(s, addr, x, y, pin, W) {
      const cy = y + RH / 2; let cx = x, p = pin;
      const slot = (i) => {
        wire(cx, cx + SW, cy, p);
        if (armed) els.push(<rect key={K()} x={cx + SW / 2 - 7} y={cy - 7} width="14" height="14" fill="#dbeafe" stroke="#2563eb" strokeDasharray="2" className="cursor-pointer" onClick={() => place(j, addr, i)} />);
        cx += SW;
      };
      s.forEach((it, i) => {
        slot(i);
        if (it.k === "BR") {
          const m = mBr(it); let py = y, lastY = cy; const outs = [];
          it.paths.forEach((ps, k) => { lastY = py + RH / 2; outs.push(ser(ps, [...addr, [i, k]], cx, py, p, m.w)); py += mSer(ps).h * RH; });
          const q = outs.some(Boolean), fb = sel && sel.j === j && !sel.coil && sel.i === i && JSON.stringify(sel.addr) === JSON.stringify(addr);
          vbar(cx, cy, lastY, p); vbar(cx + m.w, cy, lastY, q);
          els.push(<rect key={K()} x={cx - 6} y={cy - 6} width="12" height={lastY - cy + 12} fill={fb ? "#fde68a88" : "transparent"} className="cursor-pointer" onClick={() => setSel({ j, addr, i })} />);
          cx += m.w; p = q;
        } else {
          const on = ev(compile({ series: [it] }), state), o = p && on, mx = cx + CW / 2;
          const f = sel && sel.j === j && !sel.coil && sel.i === i && JSON.stringify(sel.addr) === JSON.stringify(addr);
          wire(cx, mx - (it.k === "CMP" ? 22 : 9), cy, p); wire(mx + (it.k === "CMP" ? 22 : 9), cx + CW, cy, o);
          if (it.k === "CMP") {
            els.push(<rect key={K()} x={mx - 22} y={cy - 13} width="44" height="26" fill="white" stroke={on ? "#16a34a" : "#111"} strokeWidth="2" />);
            txt(mx, cy + 4, `${it.op} ${it.val}`, "#111", "normal", 10);
          } else {
            els.push(<line key={K()} x1={mx - 9} x2={mx - 9} y1={cy - 12} y2={cy + 12} stroke={on ? "#16a34a" : "#111"} strokeWidth="2.5" />);
            els.push(<line key={K()} x1={mx + 9} x2={mx + 9} y1={cy - 12} y2={cy + 12} stroke={on ? "#16a34a" : "#111"} strokeWidth="2.5" />);
            if (it.k === "NC") els.push(<line key={K()} x1={mx - 9} x2={mx + 9} y1={cy + 12} y2={cy - 12} stroke="#111" strokeWidth="2" />);
            if (it.k === "P" || it.k === "N") txt(mx, cy + 4, it.k, "#111", "bold", 10);
          }
          txt(mx, cy - 20, it.tag); txt(mx, cy + 28, ADDR[it.tag] || "", "#6b7280", "normal", 9);
          els.push(<rect key={K()} x={cx + 4} y={cy - 24} width={CW - 8} height="52" fill="transparent" stroke={f ? "#f59e0b" : "none"} strokeWidth="2" className="cursor-pointer" onClick={() => setSel({ j, addr, i })} />);
          cx += CW; p = o;
        }
      });
      slot(s.length); wire(cx, x + W, cy, p);
      return p;
    }
    const m = mSer(r.series), x0 = 20, top = 10, cy = top + RH / 2;
    const out = ser(r.series, [], x0, top, true, m.w), cx = x0 + m.w + 34, h = m.h * RH;
    const cf = sel && sel.j === j && sel.coil;
    wire(x0 + m.w, cx - 12, cy, out); if (!r.kind) wire(cx + 12, cx + 70, cy, out);
    if (!r.kind) els.push(<circle key={K()} cx={cx} cy={cy} r="12" fill={out ? "#bbf7d0" : "white"} stroke={cf ? "#f59e0b" : out ? "#16a34a" : "#111"} strokeWidth="2.5" className="cursor-pointer" onClick={() => setSel({ j, coil: true })} />);
    if (!r.kind) { txt(cx, cy - 20, r.out); txt(cx, cy + 30, ADDR[r.out] || "", "#6b7280", "normal", 9); txt(cx, cy + 4, r.coil === "SET" ? "S" : r.coil === "RESET" ? "R" : "", "#111", "bold", 11); }
    else {
      const bx = cx - 12, q = state[(r.inst || "") + "_Q"], plain = r.kind === "MATH" || r.kind === "CRES";
      const L = r.kind === "MATH" ? [r.op, `${r.a} ${{ ADD: "+", SUB: "−", MUL: "×", DIV: "÷" }[r.op]} ${r.b}`, "→ " + (r.dest || "?")]
        : r.kind === "CRES" ? ["RESET", r.inst, ""] : [r.kind, r.inst, r.pt !== undefined ? `PT ${r.pt}ms` : `PV ${r.pv}`];
      els.push(<rect key={K()} x={bx} y={cy - 28} width="100" height="56" fill="white" stroke={cf ? "#f59e0b" : "#111"} strokeWidth="2.5" className="cursor-pointer" onClick={() => setSel({ j, coil: true })} />);
      txt(bx + 50, cy - 12, L[0], "#111", "bold", 11); txt(bx + 50, cy + 3, L[1], "#1d4ed8", "bold", 10); txt(bx + 50, cy + 18, L[2], "#6b7280", "normal", 9);
      wire(bx + 100, cx + 100, cy, plain ? out : q);
    }
    els.push(<line key={K()} x1={x0} x2={x0} y1={top} y2={top + h} stroke="#111" strokeWidth="3" />);
    els.push(<line key={K()} x1={cx + (r.kind ? 100 : 70)} x2={cx + (r.kind ? 100 : 70)} y1={top} y2={top + h} stroke="#111" strokeWidth="3" />);
    return <svg width={cx + (r.kind ? 120 : 90)} height={h + top + 20}>{els}</svg>;
  }

  return (
    <div className="space-y-3 text-black">
      <div className="flex min-h-[38px] flex-wrap items-center gap-2 rounded border border-gray-400 bg-gray-100 px-3 py-1.5 text-xs">
        <b>Properties</b>
        {!cur && <span className="text-gray-500">Click a contact, coil or branch bar to edit it.</span>}
        {cur && sel.coil && <><PropsBox r={cur} j={sel.j} edit={edit} coils={coils || COILS} names={names || TAGS} /></>}
        {cur && !sel.coil && cur.k === "BR" && <><span>Branch</span>
          <button className="btn2 !py-0.5 text-black" onClick={() => edit(sel.j, (r) => getS(r.series, sel.addr)[sel.i].paths.push([]))}>+ path</button>
          <button className="btn2 !py-0.5 text-red-600" onClick={del}>Delete branch</button></>}
        {cur && !sel.coil && cur.k !== "BR" && <><Sel v={cur.k} o={["NO", "NC", "P", "N", "CMP"]} f={(k) => upd({ k, op: cur.op || "<", val: cur.val ?? 50 })} />
          <Sel v={cur.tag} o={names || TAGS} f={(tag) => upd({ tag })} />
          {cur.k === "CMP" && <><Sel v={cur.op} o={OPS} f={(op) => upd({ op })} /><Sel v={cur.vk || "value"} o={["value", "tag"]} f={(vk) => upd({ vk })} />
            {cur.vk === "tag" ? <Sel v={cur.val} o={names || TAGS} f={(val) => upd({ val })} /> : <input value={cur.val} onChange={(e) => upd({ val: e.target.value })} className="w-16 rounded border border-gray-400 bg-white px-1 text-black" />}</>}
          <button className="btn2 !py-0.5 text-red-600" onClick={del}>Delete</button></>}
      </div>
      {nets.map(([r, j], n) => (
        <div key={j} className="overflow-hidden rounded border border-gray-400 bg-white">
          <div className="flex items-center justify-between border-b border-gray-300 bg-gray-200 px-2 py-1 text-xs">
            <span className="flex items-center gap-2"><b>Network {n + 1}:</b>
              <input value={r.c || ""} placeholder="Title…" onChange={(e) => edit(j, (x) => { x.c = e.target.value; })} className="w-64 bg-transparent outline-none" /></span>
            <button className="text-red-600" onClick={() => setRungs(rungs.filter((_, k) => k !== j))}>delete</button>
          </div>
          <input value={r.note || ""} placeholder="Network comment…" onChange={(e) => edit(j, (x) => { x.note = e.target.value; })} className="w-full border-b border-gray-200 bg-yellow-50 px-2 py-1 text-xs italic text-gray-600 outline-none" />
          <div className="overflow-x-auto bg-white p-2">{draw(r, j)}</div>
        </div>
      ))}
      <button className="btn" onClick={() => setRungs([...rungs, { out: coil, c: "", series: [] }])}>+ Add network</button>
    </div>
  );
}

function PropsBox({ r, j, edit, coils, names }) {
  const set = (p) => edit(j, (x) => Object.assign(x, p));
  const num = (k, label) => <label className="flex items-center gap-1">{label}<input type="number" value={r[k]} onChange={(e) => set({ [k]: Number(e.target.value) })} className="w-20 rounded border border-gray-400 bg-white px-1 text-black" /></label>;
  const txt = (k, label, strict) => <label className="flex items-center gap-1">{label}<input value={r[k] ?? ""} onChange={(e) => set({ [k]: strict ? e.target.value.replace(/\W/g, "").replace(/^[^A-Za-z_]+/, "") : e.target.value.replace(/[^\w.-]/g, "") })} className="w-24 rounded border border-gray-400 bg-white px-1 text-black" /></label>;
  if (!r.kind) return <><span>Coil</span><Sel v={r.coil || "OUT"} o={["OUT", "SET", "RESET"]} f={(coil) => set({ coil })} /><Sel v={r.out} o={coils} f={(out) => set({ out })} /></>;
  if (r.kind === "MATH") return <><span>{r.op}</span>{txt("a", "A")}{txt("b", "B")}<span>→</span><Sel v={r.dest || ""} o={["", ...names]} f={(dest) => set({ dest })} /><Sel v={r.dt || "Int"} o={["Int", "Real"]} f={(dt) => set({ dt })} /></>;
  return <><span>{r.kind === "CRES" ? "Reset / load counter" : r.kind}</span>{txt("inst", "Instance", true)}{r.kind === "CRES" ? null : r.pv !== undefined ? num("pv", "PV") : num("pt", "PT (ms)")}</>;
}
