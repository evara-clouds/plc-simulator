"use client";
import { BASE } from "@/lib/sim";
const TAGS = Object.keys(BASE), COILS = ["MOTOR", "VALVE", "CONVEYOR_RUN"], OPS = ["==", "!=", "<", "<=", ">", ">="];
const Sel = ({ v, o, f }) => (
  <select value={v} onChange={(e) => f(e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-[11px]">
    {o.map((x) => <option key={x}>{x}</option>)}
  </select>
);
const Wire = ({ on }) => <div className={`h-0.5 w-4 shrink-0 ${on ? "bg-emerald-400" : "bg-slate-600"}`} />;
const Head = ({ i, del, label }) => (
  <div className="mb-2 flex justify-between text-xs text-slate-400"><span>{label} {i + 1}</span><button onClick={del} className="text-red-400">delete</button></div>
);

export function LadderEditor({ rungs, setRungs, state, coil = "MOTOR" }) {
  const upd = (i, fn) => setRungs(rungs.map((r, j) => (j === i ? fn(r) : r)));
  const setRow = (i, ri, fn) => upd(i, (r) => ({ ...r, rows: r.rows.map((x, k) => (k === ri ? fn(x) : x)) }));
  let n = 0;
  return (
    <div className="space-y-3">
      {rungs.map((r, i) => r.fbd ? null : (
        <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <Head i={n++} label="Rung" del={() => setRungs(rungs.filter((_, j) => j !== i))} />
          <div className="flex items-stretch">
            <div className="w-1.5 rounded bg-slate-500" />
            <div className="flex-1 space-y-2 overflow-x-auto py-1">
              {r.rows.map((row, ri) => (
                <div key={ri} className="flex items-center">
                  <span className="w-6 shrink-0 text-center text-[10px] text-slate-500">{ri ? "OR" : ""}</span>
                  {row.map((e, ei) => {
                    const on = e.k === "CMP" ? false : e.k === "NC" ? !state[e.tag] : !!state[e.tag];
                    const chg = (p) => setRow(i, ri, (x) => x.map((y, k) => (k === ei ? { ...y, ...p } : y)));
                    return (
                      <div key={ei} className="flex items-center">
                        <Wire on={on} />
                        <div className={`space-y-1 rounded border p-1 text-center ${on ? "border-emerald-500" : "border-slate-700"}`}>
                          <div className="font-mono text-xs">{e.k === "NO" ? "┤ ├" : e.k === "NC" ? "┤/├" : "compare"}</div>
                          <Sel v={e.k} o={["NO", "NC", "CMP"]} f={(k) => chg({ k, op: "==", val: e.val ?? 0 })} />
                          <Sel v={e.tag} o={TAGS} f={(tag) => chg({ tag })} />
                          {e.k === "CMP" && <div className="flex gap-1"><Sel v={e.op} o={OPS} f={(op) => chg({ op })} />
                            <input value={e.val} onChange={(x) => chg({ val: x.target.value })} className="w-14 rounded border border-slate-700 bg-slate-900 px-1 text-[11px]" /></div>}
                          <button className="text-[10px] text-red-400" onClick={() => setRow(i, ri, (x) => x.filter((_, k) => k !== ei))}>remove</button>
                        </div>
                      </div>
                    );
                  })}
                  <Wire on={false} />
                  <button className="btn2 px-2 py-0.5 text-xs" onClick={() => setRow(i, ri, (x) => [...x, { k: "NO", tag: "START" }])}>+ contact</button>
                </div>
              ))}
              <button className="btn2 ml-6 px-2 py-0.5 text-xs" onClick={() => upd(i, (x) => ({ ...x, rows: [...x.rows, []] }))}>+ parallel branch</button>
            </div>
            <div className="flex items-center"><Wire on={state[r.out]} />
              <div className={`rounded-full border px-2 py-1 font-mono text-xs ${state[r.out] ? "border-emerald-400 text-emerald-300" : "border-slate-600"}`}>
                ( <Sel v={r.out} o={COILS} f={(out) => upd(i, (x) => ({ ...x, out }))} /> )</div></div>
            <div className="ml-2 w-1.5 rounded bg-slate-500" />
          </div>
        </div>
      ))}
      <button className="btn" onClick={() => setRungs([...rungs, { out: coil, c: "", rows: [[]] }])}>+ Add rung</button>
    </div>
  );
}

export function FbdEditor({ rungs, setRungs, state, coil = "MOTOR", names, coils }) {
  const upd = (i, fn) => setRungs(rungs.map((r, j) => (j === i ? fn(r) : r)));
  const fb = (i, fn) => upd(i, (r) => ({ ...r, fbd: fn(r.fbd) }));
  let n = 0;
  return (
    <div className="space-y-3">
      {rungs.map((r, i) => !r.fbd ? null : (
        <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <Head i={n++} label="Network" del={() => setRungs(rungs.filter((_, j) => j !== i))} />
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              {r.fbd.ins.map((p, k) => (
                <div key={k} className="flex items-center gap-1 text-[11px]">
                  {r.fbd.block === "SR" && <span className="w-3 text-slate-500">{k ? "R" : "S"}</span>}
                  <Sel v={p.tag} o={names || TAGS} f={(tag) => fb(i, (b) => ({ ...b, ins: b.ins.map((x, j) => (j === k ? { ...x, tag } : x)) }))} />
                  <label className="flex items-center gap-0.5"><input type="checkbox" checked={!!p.inv} onChange={(e) => fb(i, (b) => ({ ...b, ins: b.ins.map((x, j) => (j === k ? { ...x, inv: e.target.checked } : x)) }))} />NOT</label>
                  <button className="text-red-400" onClick={() => fb(i, (b) => ({ ...b, ins: b.ins.filter((_, j) => j !== k) }))}>×</button>
                  <Wire on={!!state[p.tag] !== !!p.inv} />
                </div>
              ))}
              <button className="btn2 px-2 py-0.5 text-xs" onClick={() => fb(i, (b) => ({ ...b, ins: [...b.ins, { tag: "START" }] }))}>+ input</button>
            </div>
            <div className="rounded border-2 border-cyan-600 bg-slate-900 px-5 py-4 text-center">
              <Sel v={r.fbd.block} o={["AND", "OR", "NOT", "SR"]} f={(block) => fb(i, (b) => ({ ...b, block }))} />
              <div className="mt-1 text-[10px] text-slate-500">{r.fbd.block === "SR" ? "set / reset latch" : "function block"}</div>
            </div>
            <Wire on={state[r.out]} />
            <div className={`rounded border px-2 py-1 font-mono text-xs ${state[r.out] ? "border-emerald-400 text-emerald-300" : "border-slate-600"}`}>
              <Sel v={r.out} o={coils || COILS} f={(out) => upd(i, (x) => ({ ...x, out }))} /></div>
          </div>
        </div>
      ))}
      <button className="btn" onClick={() => setRungs([...rungs, { out: coil, c: "", fbd: { block: "AND", ins: [{ tag: "START" }, { tag: "ESTOP" }] } }])}>+ Add network</button>
    </div>
  );
}
