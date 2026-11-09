import { prisma } from "@/lib/prisma";
import { EXAMS } from "@/lib/exams";
export const dynamic = "force-dynamic";
export const metadata = { title: "Verify a badge · PLC Practice Companion" };

export default async function Verify({ searchParams }) {
  const code = String(searchParams.code || "").trim().toUpperCase();
  let run = null;
  try { if (code) run = await prisma.examRun.findUnique({ where: { code }, include: { user: { select: { name: true } } } }); } catch {}
  return (
    <div className="mx-auto max-w-lg space-y-4 py-6">
      <h1 className="text-2xl font-bold text-cyan-400">Verify a badge</h1>
      <form action="/verify" className="flex gap-2"><input name="code" defaultValue={code} placeholder="PLC-XXXX-XXXX" className="inp font-mono" /><button className="btn">Check</button></form>
      {code && (run ? (
        <div className="space-y-1 rounded-xl border border-emerald-700 bg-emerald-950/30 p-5">
          <div className="text-lg font-bold text-emerald-300">✓ Valid badge</div>
          <div><b>{EXAMS[run.examId]?.title || run.examId}</b></div>
          <div className="text-sm text-slate-300">Holder: {run.showName ? run.user.name : "name not shown"}</div>
          <div className="text-sm text-slate-400">Passed {run.finishedAt?.toLocaleDateString()} · code <span className="font-mono">{run.code}</span></div>
        </div>) : <p className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">No badge found with that code.</p>)}
    </div>
  );
}
