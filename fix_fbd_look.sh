set -e

# ---------- 1. Create the new visual FBD component ----------
cat > components/VisualFbd.js <<'EOF'
"use client";
import { BASE, ALIAS } from "@/lib/sim";

const TAGS = Object.keys(BASE);
const COILS = ["MOTOR", "VALVE", "CONVEYOR_RUN"];

export default function VisualFbd({ rungs, setRungs, state, coil = "MOTOR" }) {
  const update = (i, fn) => setRungs(rungs.map((r, j) => (j === i ? fn(r) : r)));
  const fbUpd = (i, fn) => update(i, (r) => ({ ...r, fbd: fn(r.fbd) }));

  return (
    <div className="space-y-6">
      {rungs.map((r, i) => !r.fbd ? null : (
        <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="mb-4 flex justify-between text-xs text-slate-400">
            <span>Network {i + 1}</span>
            <button onClick={() => setRungs(rungs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300">delete</button>
          </div>

          <div className="flex items-center">
            {/* INPUTS (Left Side) */}
            <div className="flex flex-col gap-3">
              {r.fbd.ins.map((p, k) => {
                const isOn = !!state[p.tag] !== !!p.inv;
                return (
                  <div key={k} className="flex items-center">
                    {/* Input Tag & Inversion */}
                    <div className="flex items-center gap-1.5 w-[140px] justify-end">
                      <button
                        onClick={() => fbUpd(i, (b) => ({ ...b, ins: b.ins.map((x, j) => (j === k ? { ...x, inv: !x.inv } : x)) }))}
                        className={`text-[10px] font-bold rounded-sm px-1 ${p.inv ? "bg-red-900/50 text-red-400 border border-red-700" : "text-transparent border border-transparent hover:border-slate-600"}`}
                        title="Toggle Inversion (NOT)"
                      >
                        NOT
                      </button>
                      <select
                        value={p.tag}
                        onChange={(e) => fbUpd(i, (b) => ({ ...b, ins: b.ins.map((x, j) => (j === k ? { ...x, tag: e.target.value } : x)) }))}
                        className="rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-[11px] text-white w-24"
                      >
                        {TAGS.map((t) => <option key={t} value={t}>{ALIAS[t] || t}</option>)}
                      </select>
                      <button
                        onClick={() => fbUpd(i, (b) => ({ ...b, ins: b.ins.filter((_, j) => j !== k) }))}
                        className="text-slate-500 hover:text-red-400 text-xs"
                      >×</button>
                    </div>
                    {/* Wire to Block */}
                    <div className={`h-0.5 w-8 ${isOn ? "bg-emerald-400" : "bg-slate-600"}`} />
                  </div>
                );
              })}
              <div className="flex justify-end mt-1 pr-7">
                <button
                  className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-700"
                  onClick={() => fbUpd(i, (b) => ({ ...b, ins: [...b.ins, { tag: "START" }] }))}
                >
                  + input
                </button>
              </div>
            </div>

            {/* BLOCK (Center) */}
            <div className="relative flex flex-col justify-center ml-2">
              {/* Standard TIA/PLCOpen style block shape */}
              <div className={`flex flex-col items-center justify-center border-2 rounded shadow-lg bg-slate-900 min-w-[80px] py-4 px-2 ${state[r.out] ? "border-cyan-500 shadow-cyan-900/20" : "border-slate-600"}`}>
                <select
                  value={r.fbd.block}
                  onChange={(e) => fbUpd(i, (b) => ({ ...b, block: e.target.value }))}
                  className="bg-transparent text-center text-sm font-bold text-slate-200 outline-none cursor-pointer appearance-none"
                >
                  {["AND", "OR", "NOT", "SR"].map((x) => <option key={x} className="bg-slate-900">{x}</option>)}
                </select>
                <span className="text-[9px] text-slate-500 mt-1 pointer-events-none">
                  {r.fbd.block === "SR" ? "Latch" : "Logic"}
                </span>
              </div>
            </div>

            {/* WIRE & COIL (Right Side) */}
            <div className="flex items-center">
              <div className={`h-0.5 w-12 ${state[r.out] ? "bg-emerald-400" : "bg-slate-600"}`} />
              <div className={`flex items-center justify-center border-2 rounded-full h-10 w-24 bg-slate-900 text-xs font-mono font-bold ${state[r.out] ? "border-emerald-400 text-emerald-300" : "border-slate-600 text-slate-400"}`}>
                (<select
                  value={r.out}
                  onChange={(e) => update(i, (x) => ({ ...x, out: e.target.value }))}
                  className="bg-transparent text-center outline-none cursor-pointer appearance-none"
                >
                  {COILS.map((c) => <option key={c} className="bg-slate-900 text-white">{c}</option>)}
                </select>)
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        className="btn mt-2"
        onClick={() => setRungs([...rungs, { out: coil, c: "", fbd: { block: "AND", ins: [{ tag: "START" }, { tag: "ESTOP" }] } }])}
      >
        + Add network
      </button>
    </div>
  );
}
EOF

# ---------- 2. Patch app/page.js just in case aliases broke on initial load ----------
python3 - <<'PY'
p = 'app/page.js'
s = open(p).read()
# Ensure the page imports the new component (it should already, but just in case)
s = s.replace('import VisualFbd from "@/components/VisualFbd";', 'import VisualFbd from "@/components/VisualFbd";')
open(p, 'w').write(s)
PY

echo "FBD visual style updated! Your dev server should hot-reload the changes."
