import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { PROBLEMS } from "@/lib/problems";
import { EXAMS } from "@/lib/exams";
import { claimBadge } from "@/app/actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Checkpoint · PLC Practice Companion" };

export default async function Exam() {
  const u = await getUser();
  let runs = {};
  try { if (u) runs = Object.fromEntries((await prisma.examRun.findMany({ where: { userId: u.id } })).map((r) => [r.examId, r])); } catch {}
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-cyan-400">Prove it: checkpoints</h1>
      {!u && <p className="text-sm text-slate-400"><Link href="/login" className="text-cyan-400">Log in</Link> to take a checkpoint.</p>}
      {Object.entries(EXAMS).map(([id, ex]) => {
        const run = runs[id], passed = run ? JSON.parse(run.passed) : [], tries = run ? JSON.parse(run.tries) : {};
        return (
          <section key={id} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-bold">{ex.title}</h2><p className="text-sm text-slate-400">{ex.blurb}</p>
            <div className="space-y-2">
              {ex.tasks.map((t, i) => { const p = PROBLEMS.find((x) => x.id === t), done = passed.includes(t), left = ex.maxTries - (tries[t] || 0);
                return (
                  <div key={t} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 p-3">
                    <span><b>Task {i + 1}.</b> {p?.title} {done && <span className="ml-1 text-emerald-400">✓ passed</span>}</span>
                    {u && !done && (left > 0 ? <Link href={`/exam/${id}/${t}`} className="btn2">Start ({left} tries)</Link> : <span className="text-xs text-red-400">No tries left</span>)}
                  </div>); })}
            </div>
            <p className="text-sm text-slate-300">{passed.length} of {ex.tasks.length} passed. Pass mark: {ex.passMark}.</p>
            {run?.code ? <p className="rounded-lg border border-emerald-700 bg-emerald-950/30 p-3 text-sm">🏅 Badge earned. Verification code <b className="font-mono">{run.code}</b> · <Link href={`/verify?code=${run.code}`} className="text-cyan-400">verification page</Link></p>
              : passed.length >= ex.passMark && u ? (
                <form action={claimBadge} className="flex flex-wrap items-center gap-3"><input type="hidden" name="examId" value={id} />
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showName" /> Show my name on the badge page</label><button className="btn">Claim my badge</button></form>) : null}
          </section>);
      })}
    </div>
  );
}
