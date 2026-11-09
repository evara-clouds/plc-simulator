"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { scan } from "@/lib/sim";
import { initTags, stepScene, SCENE_OF } from "@/lib/scenes";
import Ladder, { Instructions } from "@/components/TiaLadder";
import SceneView from "@/components/SceneView";
import { submitExamTask } from "@/app/actions";

export default function ExamTask({ prob, examId, triesLeft }) {
  const [rungs, setRungs] = useState([{ out: prob.outputs[0], c: "", series: [] }]);
  const [tags, setTags] = useState(() => initTags(prob));
  const [armed, setArmed] = useState(null);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const rr = useRef(rungs); rr.current = rungs;
  useEffect(() => {   // you may test your logic freely before submitting
    const i = setInterval(() => setTags((p) => (document.hidden ? p : stepScene(scan(p, rr.current, prob.preset), SCENE_OF[prob.id]))), 100);
    return () => clearInterval(i);
  }, [prob]);
  const submit = async () => { setBusy(true); setRes(await submitExamTask({ examId, problemId: prob.id, rungs })); setBusy(false); };
  const names = Object.keys(tags).filter((k) => k[0] !== "_");
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-700 bg-slate-900 p-4">
        <div className="text-xs font-bold text-amber-400">CHECKPOINT · no hints · {res?.triesLeft ?? triesLeft} tries left</div>
        <h1 className="text-xl font-bold">{prob.title}</h1><p className="text-sm text-slate-300">{prob.text}</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 space-y-3">
          <Ladder rungs={rungs} setRungs={setRungs} state={tags} armed={armed} setArmed={setArmed} coil={prob.outputs[0]} names={names} coils={prob.outputs} />
          <SceneView prob={prob} t={tags} setT={setTags} />
        </div>
        <Instructions armed={armed} setArmed={setArmed} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn" disabled={busy} onClick={submit}>Submit answer</button>
        {res?.error && <span className="text-sm text-red-400">{res.error}</span>}
        {res && !res.error && (res.passed ? <span className="text-sm font-bold text-emerald-400">✓ Task passed ({res.done} done)</span> : <span className="text-sm text-amber-400">Not yet. Hidden tests failed, {res.triesLeft} tries left.</span>)}
        <Link href="/exam" className="text-sm text-cyan-400">Back to the checkpoint</Link>
      </div>
    </div>
  );
}
