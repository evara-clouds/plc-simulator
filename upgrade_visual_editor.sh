set -e

# ---------- 1. Add variable aliases to the sim lib ----------
cat > lib/sim.js <<'EOF'
export const BASE = { START: false, STOP: true, ESTOP: true, MODE: "AUTO", MANUAL_VALVE: false,
  MOTOR: false, VALVE: false, CONVEYOR_RUN: false, SENSOR_BOX: false,
  TANK_LEVEL: 15, BOX_POS: 0, COUNTER_VAL: 0 };

export const ALIAS = {
  START: "PB1",
  STOP: "PB2",
  ESTOP: "ESTOP",
  MODE: "MODE",
  MANUAL_VALVE: "MAN_VALVE",
  MOTOR: "LAMP1",
  VALVE: "VALVE1",
  CONVEYOR_RUN: "CONV1",
  SENSOR_BOX: "SENS1",
  TANK_LEVEL: "TANK_LVL",
  BOX_POS: "BOX_POS",
  COUNTER_VAL: "COUNT"
};

export const ADDR = { START: "I:0/0", STOP: "I:0/1", ESTOP: "I:0/2", SENSOR_BOX: "I:0/3", MANUAL_VALVE: "I:0/4",
  MOTOR: "Q:0/0", VALVE: "Q:0/1", CONVEYOR_RUN: "Q:0/2", MODE: "M:0", TANK_LEVEL: "F8:0", BOX_POS: "F8:1", COUNTER_VAL: "N7:0" };

const no = (tag) => ({ k: "NO", tag });
const nc = (tag) => ({ k: "NC", tag });
const cmp = (tag, op, val) => ({ k: "CMP", tag, op, val });

export const PRESETS = {
  tank: {
    name: "Water Tank",
    rungs: [
      { out: "MOTOR", c: "Agitator latch", rows: [[no("START"), no("STOP"), no("ESTOP")], [no("MOTOR"), no("STOP"), no("ESTOP")]] },
      { out: "VALVE", c: "Inlet valve", rows: [[no("ESTOP"), cmp("MODE", "==", "AUTO"), cmp("TANK_LEVEL", "<", 80)], [no("ESTOP"), cmp("MODE", "==", "MANUAL"), no("MANUAL_VALVE")]] }
    ]
  },
  conveyor: {
    name: "Conveyor & Counter",
    rungs: [
      { out: "CONVEYOR_RUN", c: "Conveyor latch", rows: [[no("START"), no("STOP"), no("ESTOP")], [no("CONVEYOR_RUN"), no("STOP"), no("ESTOP")]] }
    ]
  }
};

export const SAFE = /^[\w\s&|!()<>=']+$/;

const term = (i) => (i.inv ? "!" : "") + i.tag;

export function compile(r) {
  if (r.fbd) {
    const { block, ins } = r.fbd;
    if (!ins.length) return "false";
    if (block === "AND") return ins.map(term).join(" && ");
    if (block === "OR") return ins.map(term).join(" || ");
    if (block === "NOT") return "!" + ins[0].tag;
    return ins.length < 2 ? "false" : `(${term(ins[0])} || ${r.out}) && !(${term(ins[1])})`;
  }
  if (r.rows) {
    const rows = r.rows.filter((x) => x.length);
    if (!rows.length) return "false";
    return rows.map((row) => "(" + row.map((e) => {
      if (e.k === "NC") return "!" + e.tag;
      if (e.k === "CMP") {
        const v = isNaN(e.val) || e.val === "" ? `'${String(e.val).replace(/\W/g, "")}'` : Number(e.val);
        return `${e.tag} ${e.op} ${v}`;
      }
      return e.tag;
    }).join(" && ") + ")").join(" || ");
  }
  return r.expr || "false";
}

export function ev(expr, t) {
  if (!SAFE.test(expr)) return false;
  try { return !!new Function(...Object.keys(t), `return (${expr});`)(...Object.values(t)); } catch { return false; }
}

export function scan(p, rungs, preset) {
  const t = { ...p };
  for (const r of rungs) t[r.out] = ev(compile(r), t);
  if (preset === "tank") {
    t.TANK_LEVEL = Math.round(Math.max(0, Math.min(100, t.TANK_LEVEL + (t.VALVE ? 2 : 0) - 0.8)) * 10) / 10;
  } else {
    if (t.CONVEYOR_RUN) t.BOX_POS = (t.BOX_POS + 4) % 100;
    t.SENSOR_BOX = t.BOX_POS >= 48 && t.BOX_POS < 56;
    if (t.SENSOR_BOX && !p.SENSOR_BOX) t.COUNTER_VAL += 1;
  }
  return t;
}

export function runTests(rungs, preset, tests) {
  let t = { ...BASE };
  return tests.map(([label, set, expect]) => {
    t = { ...t, ...set };
    for (let i = 0; i < 2; i++) t = scan(t, rungs, preset);
    const bad = Object.entries(expect).filter(([k, v]) => t[k] !== v);
    return { label, ok: !bad.length, got: bad.map(([k, v]) => `${k}=${t[k]} (want ${v})`).join(", ") };
  });
}
EOF

# ---------- 2. Build the new visual editors ----------
cat > components/VisualLadder.js <<'EOF'
"use client";
import { useState } from "react";
import { BASE, ALIAS } from "@/lib/sim";

const TAGS = Object.keys(BASE);
const COILS = ["MOTOR", "VALVE", "CONVEYOR_RUN"];

export default function VisualLadder({ rungs, setRungs, state, coil = "MOTOR" }) {
  const [selected, setSelected] = useState(null);

  const updateRung = (i, fn) => {
    setRungs(rungs.map((r, j) => (j === i ? fn(r) : r)));
  };

  const addContact = (i, ri) => {
    updateRung(i, (r) => ({
      ...r,
      rows: r.rows.map((row, k) => (k === ri ? [...row, { k: "NO", tag: "START" }] : row))
    }));
  };

  const addRow = (i) => updateRung(i, (r) => ({ ...r, rows: [...r.rows, []] }));

  const removeContact = (i, ri, ci) => {
    updateRung(i, (r) => ({
      ...r,
      rows: r.rows.map((row, k) => (k === ri ? row.filter((_, j) => j !== ci) : row))
    }));
  };

  const changeElement = (i, ri, ci, patch) => {
    updateRung(i, (r) => ({
      ...r,
      rows: r.rows.map((row, k) =>
        k === ri ? row.map((el, j) => (j === ci ? { ...el, ...patch } : el)) : row
      )
    }));
  };

  const addRung = () => setRungs([...rungs, { out: coil, c: "", rows: [[]] }]);
  const removeRung = (i) => setRungs(rungs.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {rungs.map((r, i) => (
        <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>Rung {i + 1} · {r.c || "—"}</span>
            <button onClick={() => removeRung(i)} className="text-red-400">delete</button>
          </div>

          <div className="flex items-start gap-2 overflow-x-auto pb-2">
            {/* Power rail */}
            <div className="h-full w-1.5 shrink-0 rounded bg-slate-500" />

            <div className="flex-1 space-y-2">
              {r.rows.map((row, ri) => (
                <div key={ri} className="flex items-center gap-1">
                  <span className="w-6 text-center text-[10px] text-slate-500">{ri ? "OR" : ""}</span>

                  {row.map((el, ci) => {
                    const active = el.k === "CMP" ? false
                      : el.k === "NC" ? !state[el.tag]
                      : !!state[el.tag];

                    return (
                      <div key={ci} className="flex items-center">
                        <div className={`h-0.5 w-4 ${active ? "bg-emerald-400" : "bg-slate-600"}`} />
                        <div className={`rounded border p-1 ${active ? "border-emerald-500" : "border-slate-700"}`}>
                          <select
                            value={el.k}
                            onChange={(e) => changeElement(i, ri, ci, { k: e.target.value, op: "==", val: el.val ?? 0 })}
                            className="w-16 rounded bg-slate-900 px-1 text-[11px] text-white"
                          >
                            <option>NO</option>
                            <option>NC</option>
                            <option>CMP</option>
                          </select>
                          <select
                            value={el.tag}
                            onChange={(e) => changeElement(i, ri, ci, { tag: e.target.value })}
                            className="mt-1 w-28 rounded bg-slate-900 px-1 text-[11px]"
                          >
                            {TAGS.map((t) => (
                              <option key={t} value={t}>{ALIAS[t] || t}</option>
                            ))}
                          </select>
                          {el.k === "CMP" && (
                            <div className="mt-1 flex gap-1">
                              <select
                                value={el.op}
                                onChange={(e) => changeElement(i, ri, ci, { op: e.target.value })}
                                className="w-12 rounded bg-slate-900 px-1 text-[11px]"
                              >
                                {["==", "!=", "<", "<=", ">", ">="].map((op) => (
                                  <option key={op}>{op}</option>
                                ))}
                              </select>
                              <input
                                value={el.val}
                                onChange={(e) => changeElement(i, ri, ci, { val: e.target.value })}
                                className="w-14 rounded bg-slate-900 px-1 text-[11px]"
                              />
                            </div>
                          )}
                          <button
                            onClick={() => removeContact(i, ri, ci)}
                            className="mt-1 block w-full rounded bg-red-950 px-1 text-[10px] text-red-300"
                          >
                            remove
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="h-0.5 w-4 bg-slate-600" />
                  <button onClick={() => addContact(i, ri)} className="btn2 px-2 py-0.5 text-xs">+ contact</button>
                </div>
              ))}

              <button onClick={() => addRow(i)} className="btn2 ml-6 px-2 py-0.5 text-xs">+ parallel branch</button>
            </div>

            {/* Coil */}
            <div className="flex items-center">
              <div className={`h-0.5 w-4 ${state[r.out] ? "bg-emerald-400" : "bg-slate-600"}`} />
              <div className={`rounded-full border px-2 py-1 font-mono text-xs ${state[r.out] ? "border-emerald-400 text-emerald-300" : "border-slate-600"}`}>
                (<select
                  value={r.out}
                  onChange={(e) => updateRung(i, (x) => ({ ...x, out: e.target.value }))}
                  className="bg-transparent text-white"
                >
                  {COILS.map((c) => <option key={c}>{c}</option>)}
                </select>)
              </div>
            </div>

            <div className="h-full w-1.5 shrink-0 rounded bg-slate-500" />
          </div>
        </div>
      ))}

      <button onClick={addRung} className="btn">+ Add rung</button>
    </div>
  );
}
EOF

cat > components/VisualFbd.js <<'EOF'
"use client";
import { BASE, ALIAS } from "@/lib/sim";

const TAGS = Object.keys(BASE);
const COILS = ["MOTOR", "VALVE", "CONVEYOR_RUN"];

export default function VisualFbd({ rungs, setRungs, state, coil = "MOTOR" }) {
  const update = (i, fn) => setRungs(rungs.map((r, j) => (j === i ? fn(r) : r)));

  const fbUpd = (i, fn) => update(i, (r) => ({ ...r, fbd: fn(r.fbd) }));

  return (
    <div className="space-y-4">
      {rungs.map((r, i) => !r.fbd ? null : (
        <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>Network {i + 1}</span>
            <button onClick={() => setRungs(rungs.filter((_, j) => j !== i))} className="text-red-400">delete</button>
          </div>

          <div className="flex items-center gap-3">
            <div className="space-y-1">
              {r.fbd.ins.map((p, k) => (
                <div key={k} className="flex items-center gap-1 text-[11px]">
                  {r.fbd.block === "SR" && <span className="w-3 text-slate-500">{k ? "R" : "S"}</span>}
                  <select
                    value={p.tag}
                    onChange={(e) => fbUpd(i, (b) => ({
                      ...b,
                      ins: b.ins.map((x, j) => (j === k ? { ...x, tag: e.target.value } : x))
                    }))}
                    className="rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-[11px]"
                  >
                    {TAGS.map((t) => <option key={t} value={t}>{ALIAS[t] || t}</option>)}
                  </select>
                  <label className="flex items-center gap-0.5">
                    <input
                      type="checkbox"
                      checked={!!p.inv}
                      onChange={(e) => fbUpd(i, (b) => ({
                        ...b,
                        ins: b.ins.map((x, j) => (j === k ? { ...x, inv: e.target.checked } : x))
                      }))}
                    />
                    NOT
                  </label>
                  <button
                    className="text-red-400"
                    onClick={() => fbUpd(i, (b) => ({ ...b, ins: b.ins.filter((_, j) => j !== k) }))}
                  >
                    ×
                  </button>
                  <div className={`h-0.5 w-4 ${!!state[p.tag] !== !!p.inv ? "bg-emerald-400" : "bg-slate-600"}`} />
                </div>
              ))}
              <button
                className="btn2 px-2 py-0.5 text-xs"
                onClick={() => fbUpd(i, (b) => ({ ...b, ins: [...b.ins, { tag: "START" }] }))}
              >
                + input
              </button>
            </div>

            <div className="rounded border-2 border-cyan-600 bg-slate-900 px-5 py-4 text-center">
              <select
                value={r.fbd.block}
                onChange={(e) => fbUpd(i, (b) => ({ ...b, block: e.target.value }))}
                className="rounded bg-slate-800 px-1 py-0.5 text-xs"
              >
                {["AND", "OR", "NOT", "SR"].map((x) => <option key={x}>{x}</option>)}
              </select>
              <div className="mt-1 text-[10px] text-slate-500">
                {r.fbd.block === "SR" ? "set / reset latch" : "function block"}
              </div>
            </div>

            <div className={`h-0.5 w-4 ${state[r.out] ? "bg-emerald-400" : "bg-slate-600"}`} />
            <div className={`rounded border px-2 py-1 font-mono text-xs ${state[r.out] ? "border-emerald-400 text-emerald-300" : "border-slate-600"}`}>
              <select
                value={r.out}
                onChange={(e) => update(i, (x) => ({ ...x, out: e.target.value }))}
                className="bg-transparent text-white"
              >
                {COILS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        className="btn"
        onClick={() => setRungs([...rungs, { out: coil, c: "", fbd: { block: "AND", ins: [{ tag: "START" }, { tag: "ESTOP" }] } }])}
      >
        + Add network
      </button>
    </div>
  );
}
EOF

# ---------- 3. Patch app/page.js to use the new visual editors ----------
python3 - <<'PY'
p = 'app/page.js'
s = open(p).read()

# Replace the old imports
s = s.replace(
    'import { LadderEditor, FbdEditor } from "@/components/Editors";',
    'import VisualLadder from "@/components/VisualLadder";\nimport VisualFbd from "@/components/VisualFbd";'
)

# Replace the editor components
s = s.replace(
    '<LadderEditor rungs={rungs} setRungs={setRungs} state={tags} coil={prob?.out} />',
    '<VisualLadder rungs={rungs} setRungs={setRungs} state={tags} coil={prob?.out} />'
)
s = s.replace(
    '<FbdEditor rungs={rungs} setRungs={setRungs} state={tags} coil={prob?.out} />',
    '<VisualFbd rungs={rungs} setRungs={setRungs} state={tags} coil={prob?.out} />'
)

open(p, 'w').write(s)
print("PATCHED app/page.js")
PY

echo "Visual upgrade complete. Now run: npx prisma db push && npm run dev"
