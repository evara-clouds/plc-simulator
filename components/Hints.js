"use client";
import { useEffect, useState } from "react";
import { getHints, revealHint } from "@/app/actions";
import { PROBLEMS } from "@/lib/problems";
import { TRACKS } from "@/lib/tracks";
const LABEL = ["Hint 1", "Hint 2", "Solution"];

export default function HintPanel({ problemId, tick }) {
  const [s, setS] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { getHints({ problemId }).then(setS); }, [problemId, tick]);
  if (!s) return null;
  if (s.error) return <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-500">{s.error}</p>;
  const track = TRACKS.find((t) => t.problems.includes(problemId));
  const next = PROBLEMS.find((p) => p.id === track?.problems[track.problems.indexOf(problemId) + 1]);
  const ask = async () => { const r = await revealHint({ problemId }); if (r.error) setErr(r.error); else { setErr(""); setS(r); } };
  return (
    <div className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-xs">
      <div className="flex justify-between text-slate-400">
        <span>{track ? `${track.title} · ${track.problems.indexOf(problemId) + 1}/${track.problems.length}` : ""}</span>
        <span>{s.solved ? <b className="text-emerald-400">✓ Solved</b> : `Failed checks: ${s.attempts}`}</span>
      </div>
      {s.revealed.map((h, i) => (
        <div key={i} className={`whitespace-pre-wrap rounded border p-2 ${i === 2 ? "border-amber-700 bg-amber-950/30 font-mono" : "border-slate-700 bg-slate-950"}`}>
          <b className="block text-cyan-400">{LABEL[i]}</b>{i === 2 ? h.replace(/; /g, "\n") : h}
        </div>
      ))}
      {s.hints < 3 && (s.canNext
        ? <button className="btn2 w-full" onClick={ask}>Show {LABEL[s.hints].toLowerCase()}</button>
        : <p className="text-slate-500">🔒 {LABEL[s.hints]} unlocks after {s.need} failed checks ({s.attempts}/{s.need}).</p>)}
      {err && <p className="text-red-400">{err}</p>}
      {s.solved && next && <a href={`/lab?problem=${next.id}`} className="btn block text-center">Next: {next.title} →</a>}
    </div>
  );
}
