"use client";
import { useState, useEffect, useRef } from "react";
import { saveProject, getProject, checkSolution } from "@/app/actions";
import HintPanel from "@/components/Hints";
import { BASE, ADDR, GROUPS, PRESETS, scan, runTests, norm, deriveTags, mkBlock } from "@/lib/sim";
import TagTable from "@/components/TagTable";
import { PROBLEMS } from "@/lib/problems";
import Ladder, { Instructions } from "@/components/TiaLadder";
import SceneView from "@/components/SceneView";
import { SCENE_OF, stepScene, initTags } from "@/lib/scenes";
import { FbdEditor } from "@/components/Editors";

function Scene({ t, preset, set }) {
  const hold = (k) => ({
    onPointerDown: () => set((p) => ({ ...p, [k]: k !== "STOP" })),
    onPointerUp: () => setTimeout(() => set((p) => ({ ...p, [k]: k === "STOP" })), 250),
  });
  const Row = ({ l, v, a, b }) => (
    <div className="flex items-center justify-between gap-3 text-sm"><span>{l}</span>
      <span className={`rounded px-2 py-0.5 text-xs font-bold ${v ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>{v ? a : b}</span></div>);
  return (
    <div className="space-y-5">
      {preset === "tank" ? (
        <div className="flex items-center gap-6">
          <div className="relative h-56 w-32 overflow-hidden rounded-b-2xl border-4 border-slate-600 bg-slate-950">
            <div className="absolute bottom-0 w-full bg-cyan-500/80 transition-all" style={{ height: `${t.TANK_LEVEL}%` }} />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-black">{t.TANK_LEVEL}%</div>
          </div>
          <div className="flex-1 space-y-2"><Row l="Inlet valve" v={t.VALVE} a="OPEN" b="CLOSED" /><Row l="Agitator" v={t.MOTOR} a="RUNNING" b="STOPPED" /></div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative h-20 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <div className="absolute bottom-2 h-12 w-12 rounded bg-cyan-600 text-center text-xs font-bold leading-[3rem]" style={{ left: `${t.BOX_POS * 0.9}%` }}>BOX</div>
            <div className="absolute top-0 h-full w-2 bg-amber-500" style={{ left: "50%" }} />
          </div>
          <Row l="Conveyor" v={t.CONVEYOR_RUN} a="MOVING" b="HALTED" />
          <div className="text-sm">Boxes counted: <b className="text-emerald-400">{t.COUNTER_VAL}</b></div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <button {...hold("START")} className="rounded-lg bg-emerald-600 py-3 text-sm font-bold">START</button>
        <button {...hold("STOP")} className="rounded-lg bg-slate-700 py-3 text-sm font-bold">STOP</button>
        <button onClick={() => set((p) => ({ ...p, ESTOP: !p.ESTOP }))} className={`rounded-lg py-3 text-sm font-bold ${!t.ESTOP ? "animate-pulse bg-red-600" : "border border-red-900 bg-slate-800 text-red-400"}`}>E-STOP</button>
      </div>
    </div>
  );
}

export default function Page() {
  const [preset, setPreset] = useState("tank");
  const [rungs, setRungs] = useState(PRESETS.tank.rungs);
  const [tags, setTags] = useState(BASE);
  const [run, setRun] = useState(false);
  const [tab, setTab] = useState("ladder");
  const [armed, setArmed] = useState(null);
  const [title, setTitle] = useState("My PLC project");
  const [pid, setPid] = useState(null);
  const [msg, setMsg] = useState("");
  const [prob, setProb] = useState(null);
  const [res, setRes] = useState(null);
  const [meta, setMeta] = useState({ userTags: [], comments: {} });
  const rr = useRef(rungs); rr.current = rungs;
  const cfgRef = useRef(null);
  cfgRef.current = prob ? SCENE_OF[prob.id] : null;

  useEffect(() => {
    if (!run) return;
    const i = setInterval(() => setTags((p) => (document.hidden ? p : stepScene(scan(p, rr.current, preset), cfgRef.current))), 100);
    return () => clearInterval(i);
  }, [run, preset]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const pr = PROBLEMS.find((x) => x.id === q.get("problem"));
    if (pr) { setProb(pr); setPreset(pr.preset); setRungs([{ out: pr.out || pr.outputs[0], c: "", series: [] }]); setTags(initTags(pr)); setRun(true); return; }
    if (q.get("project")) getProject(q.get("project")).then((p) => {
      if (!p) return setMsg("Project not found (log in?)");
      setPid(p.id); setTitle(p.title); setPreset(p.data.preset); setRungs(norm(p.data.rungs)); setMeta(p.data.meta || { userTags: [], comments: {} }); { const q2 = PROBLEMS.find((x) => x.id === p.data.problem) || null; setProb(q2); setTags(initTags(q2)); }
    });
  }, []);

  const choose = (k) => { setPreset(k); setRungs(PRESETS[k].rungs); setTags(BASE); setRun(false); setPid(null); setProb(null); };
  const save = async (share) => {
    const r = await saveProject({ id: pid, title, data: { preset, rungs, problem: prob?.id, meta }, isPublic: share });
    if (r?.error) setMsg(r.error);
    else { setPid(r.id); setMsg(share ? (r.solved ? "Shared ✓ all tests passed!" : "Shared ✓") : "Saved ✓"); }
  };
  const setT = (k, v) => setTags((p) => ({ ...p, [k]: v }));
  const allNames = [...new Set([...(prob?.tags ? Object.keys(tags).filter((k) => k[0] !== "_") : Object.keys(BASE)), ...meta.userTags.map((u) => u.name), ...deriveTags(rungs)])];
  const allCoils = [...(prob?.tags ? prob.outputs : ["MOTOR", "VALVE", "CONVEYOR_RUN"]), ...meta.userTags.filter((u) => u.type === "Bool").map((u) => u.name)];
  const addBlock = (id) => { setRungs((rs) => [...rs, mkBlock(id, rs, prob?.outputs?.[0] || "MOTOR")]); setTab("ladder"); };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900 p-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setRun(!run)} className={`rounded px-4 py-1.5 text-sm font-bold ${run ? "bg-amber-600" : "bg-emerald-600"}`}>{run ? "⏸ Stop PLC" : "▶ Run PLC"}</button>
          <button className="btn2" onClick={() => { setTags(initTags(prob)); setRun(false); }}>↺ Reset</button>
          <a href="/lab/projects" className="btn2">Industrial projects</a>
          <select value={preset} onChange={(e) => choose(e.target.value)} className="inp w-44 py-1">
            {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="inp w-44 py-1" />
          <button className="btn" onClick={() => save()}>Save</button><button className="btn2 text-cyan-400" onClick={() => save(true)}>Share</button><span className="text-xs text-slate-400">{msg}</span>
        </div>
      </div>

      <div className={`grid gap-3 ${tab === "ladder" ? "lg:grid-cols-[17rem_minmax(0,1fr)_15rem] xl:grid-cols-[20rem_minmax(0,1fr)_17rem]" : "lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]"}`}>
        {/* LEFT: Description + Tags (Factory I/O style) */}
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <div className="mb-1 text-sm font-bold text-cyan-400">Description</div>
            {prob ? (<>
              <div className="text-sm font-semibold"><span className="mr-2 rounded bg-slate-800 px-1.5 text-xs">{prob.level}</span>{prob.title}</div>
              <p className="mt-1 text-xs text-slate-300">{prob.text}</p>
              <button className="btn mt-2 w-full" onClick={async () => { const r = await checkSolution({ problemId: prob.id, rungs }); if (r.error) setMsg(r.error); else { setRes(r.results); setMsg(r.signedIn ? "" : "Log in to save your progress"); } }}>Validate solution</button>
              {res && <div className="mt-2 space-y-1 text-xs">
                {res.map((r, i) => <div key={i} className={r.ok ? "text-emerald-400" : "text-red-400"}>{r.ok ? "✓" : "✗"} {r.label}{r.ok ? "" : ` — ${r.got}`}</div>)}
                {res.every((r) => r.ok) && <div className="font-bold text-emerald-300">🎉 All tests passed!</div>}
              </div>}
            <HintPanel problemId={prob.id} tick={res} />
            </>) : <p className="text-xs text-slate-300">{PRESETS[preset].info}</p>}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <div className="mb-1 text-sm font-bold text-cyan-400">Tags</div>
            {(prob?.tags ? [["Inputs", prob.inputs], ["Outputs", prob.outputs], ["Memory", Object.keys(tags).filter((k) => !prob.inputs.includes(k) && !prob.outputs.includes(k) && !k.startsWith("_"))]] : GROUPS).map(([g, names]) => (
              <div key={g}>
                <div className="mt-2 text-[10px] uppercase tracking-wide text-slate-500">{g}</div>
                {names.map((k) => { const v = tags[k]; return (
                  <div key={k} className="flex items-center justify-between border-b border-slate-800 py-1 font-mono text-xs">
                    <span>{k} <span className="text-cyan-600">{ADDR[k] || (prob?.tags ? (prob.inputs.includes(k) ? "%I0." + prob.inputs.indexOf(k) : prob.outputs.includes(k) ? "%Q0." + prob.outputs.indexOf(k) : "") : "")}</span></span>
                    {typeof v === "number" ? <input type="number" value={v} onChange={(e) => setT(k, Number(e.target.value))} className="w-16 rounded border border-slate-700 bg-slate-950 px-1" />
                      : k === "MODE" ? <button className="btn2 !py-0 text-xs" onClick={() => setT(k, v === "AUTO" ? "MANUAL" : "AUTO")}>{v}</button>
                      : g === "Inputs" ? <button onClick={() => setT(k, !v)} className={`w-8 rounded ${v ? "bg-emerald-600" : "bg-slate-700"}`}>{v ? 1 : 0}</button>
                      : <span className={v ? "text-emerald-400" : "text-slate-500"}>{v ? 1 : 0}</span>}
                  </div>); })}
              </div>))}
          </div>
        </div>

        {/* CENTER: networks / scene */}
        <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-3 lg:min-h-[calc(100vh-11rem)]">
          <div className="mb-3 flex flex-wrap gap-1">
            {[["ladder", "LAD – Ladder"], ["fbd", "FBD"], ["tags", "Tag table"], ["scene", "Scene (Factory I/O)"]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded px-3 py-1 text-xs font-semibold ${tab === k ? "bg-cyan-600" : "bg-slate-800 text-slate-300"}`}>{l}</button>))}
            <span className={`ml-auto text-xs font-mono ${run ? "text-emerald-400" : "text-amber-400"}`}>{run ? "● RUN" : "● STOP"}</span>
          </div>
          {tab === "ladder" && <Ladder rungs={rungs} setRungs={setRungs} state={tags} armed={armed} setArmed={setArmed} coil={prob?.out || prob?.outputs?.[0]} names={allNames} coils={allCoils} />}
          {tab === "ladder" && prob?.tags && <div className="mt-4"><SceneView prob={prob} t={tags} setT={setTags} /></div>}
          {tab === "fbd" && <FbdEditor rungs={rungs} setRungs={setRungs} state={tags} coil={prob?.out || prob?.outputs?.[0]} names={prob?.tags ? Object.keys(tags).filter((k) => !k.startsWith("_")) : undefined} coils={prob?.tags ? prob.outputs : undefined} />}
          {tab === "tags" && <TagTable tags={tags} setTags={setTags} prob={prob} rungs={rungs} meta={meta} setMeta={setMeta} />}
          {tab === "scene" && (prob?.tags ? <SceneView prob={prob} t={tags} setT={setTags} /> : <Scene t={tags} preset={preset} set={setTags} />)}
        </div>

        {/* RIGHT: Instructions task card */}
        {tab === "ladder" && <div><Instructions armed={armed} setArmed={setArmed} onAdd={addBlock} /></div>}
      </div>
    </div>
  );
}

function Lamps({ t, outs }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {outs.map((o) => (
        <div key={o} className="flex flex-col items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className={`h-8 w-8 rounded-full ${t[o] ? "bg-emerald-400 shadow-[0_0_14px_#34d399]" : "bg-slate-700"}`} />
          <span className="font-mono text-xs">{o}</span>
        </div>
      ))}
    </div>
  );
}
