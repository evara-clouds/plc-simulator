import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { PROBLEMS } from "@/lib/problems";
import { TRACKS } from "@/lib/tracks";
export const dynamic = "force-dynamic";
const COL = { Easy: "text-emerald-400", Medium: "text-amber-400", Hard: "text-red-400" };
const BAR = { Easy: "bg-emerald-500", Medium: "bg-amber-500", Hard: "bg-red-500", All: "bg-cyan-500" };
const Bar = ({ done, total, c = "bg-cyan-500" }) => (
  <div className="h-2 w-full overflow-hidden rounded bg-slate-800"><div className={`h-full ${c}`} style={{ width: `${total ? (100 * done) / total : 0}%` }} /></div>
);
const chip = (on) => `rounded-full border px-3 py-1 text-xs ${on ? "border-cyan-500 bg-cyan-900/40 text-cyan-200" : "border-slate-700 text-slate-400 hover:text-white"}`;

export default async function Problems({ searchParams }) {
  const u = await getUser();
  let P = {}, counts = {};
  try {
    if (u) P = Object.fromEntries((await prisma.progress.findMany({ where: { userId: u.id } })).map((r) => [r.problemId, r]));
    counts = Object.fromEntries((await prisma.project.groupBy({ by: ["problemId"], where: { isPublic: true, solved: true, problemId: { not: null } }, _count: { _all: true } })).map((r) => [r.problemId, r._count._all]));
  } catch {}
  const byId = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
  const done = (id) => !!P[id]?.solved;
  const solvedN = PROBLEMS.filter((p) => done(p.id)).length;
  const byLevel = searchParams.view === "level";

  const Card = ({ p, n, next }) => (
    <div className={`space-y-2 rounded-xl border bg-slate-900 p-4 ${done(p.id) ? "border-emerald-700" : next ? "border-cyan-500 ring-1 ring-cyan-500/40" : "border-slate-800"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-bold">{n ? <span className="mr-1 text-slate-500">{n}.</span> : null}{p.title}</div>
        {done(p.id) ? <span className="shrink-0 rounded bg-emerald-900 px-1.5 py-0.5 text-[10px] text-emerald-300">✓ SOLVED</span>
          : next ? <span className="shrink-0 rounded bg-cyan-900 px-1.5 py-0.5 text-[10px] text-cyan-200">NEXT UP</span> : null}
      </div>
      <div className={`text-xs ${COL[p.level]}`}>{p.level}{P[p.id] && !done(p.id) && P[p.id].attempts > 0 ? <span className="text-slate-500"> · {P[p.id].attempts} failed check{P[p.id].attempts > 1 ? "s" : ""}</span> : null}</div>
      <p className="text-sm text-slate-400">{p.text}</p>
      <div className="flex items-center gap-3">
        <Link href={`/lab?problem=${p.id}`} className="btn inline-block">{done(p.id) ? "Review" : "Solve"}</Link>
        {counts[p.id] > 0 && <Link href={`/community?problem=${p.id}`} className="text-xs text-cyan-400">{counts[p.id]} verified solution{counts[p.id] > 1 ? "s" : ""} →</Link>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-bold text-cyan-400">Problems</h1>
          <div className="text-sm"><b className="text-xl text-white">{solvedN}</b> of {PROBLEMS.length} solved</div>
        </div>
        <Bar done={solvedN} total={PROBLEMS.length} />
        <div className="grid gap-3 sm:grid-cols-3">
          {["Easy", "Medium", "Hard"].map((lv) => { const l = PROBLEMS.filter((p) => p.level === lv); const d = l.filter((p) => done(p.id)).length;
            return <div key={lv} className="space-y-1"><div className="flex justify-between text-xs"><span className={COL[lv]}>{lv}</span><span className="text-slate-400">{d}/{l.length}</span></div><Bar done={d} total={l.length} c={BAR[lv]} /></div>; })}
        </div>
        {!u && <p className="text-xs text-slate-400"><Link href="/login" className="text-cyan-400">Log in</Link> to save your progress and use hints.</p>}
      </div>
      <div className="flex gap-2"><Link href="/problems" className={chip(!byLevel)}>Learning paths</Link><Link href="/problems?view=level" className={chip(byLevel)}>By difficulty</Link></div>

      {!byLevel && TRACKS.map((t) => {
        const ids = t.problems.filter((id) => byId[id]); const d = ids.filter(done).length; const nextId = ids.find((id) => !done(id));
        return (
          <section key={t.id} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div><h2 className="text-xl font-bold">{t.title}</h2><p className="text-sm text-slate-400">{t.blurb}</p></div>
              <div className="w-48 space-y-1 text-right text-xs text-slate-400"><div>{d}/{ids.length} done</div><Bar done={d} total={ids.length} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{ids.map((id, i) => <Card key={id} p={byId[id]} n={i + 1} next={id === nextId} />)}</div>
          </section>
        );
      })}

      {byLevel && ["Easy", "Medium", "Hard"].map((lv) => {
        const l = PROBLEMS.filter((p) => p.level === lv);
        return (
          <section key={lv} className="space-y-3">
            <h2 className={`text-lg font-semibold ${COL[lv]}`}>{lv} <span className="text-sm text-slate-500">{l.filter((p) => done(p.id)).length}/{l.length}</span></h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{l.map((p) => <Card key={p.id} p={p} />)}</div>
          </section>
        );
      })}
    </div>
  );
}
