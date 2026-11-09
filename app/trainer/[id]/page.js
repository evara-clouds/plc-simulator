import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { isTrainer } from "@/lib/trainer";
import { classReport } from "@/lib/classdata";
export const dynamic = "force-dynamic";

export default async function ClassPage({ params }) {
  const u = await getUser();
  if (!u || !isTrainer(u)) redirect("/trainer");
  const c = await prisma.class.findUnique({ where: { id: params.id } });
  if (!c || c.ownerId !== u.id) notFound();
  const rows = await classReport(c.id);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><Link href="/trainer" className="text-xs text-cyan-400">← All classes</Link><h1 className="text-2xl font-bold">{c.name}</h1>
          <p className="text-sm text-slate-400">Trainees join at <b>/join</b> with the code <b className="font-mono text-amber-400">{c.code}</b></p></div>
        <a href={`/trainer/${c.id}/csv`} className="btn2">Download CSV</a>
      </div>
      {rows.length === 0 ? <p className="text-slate-500">Nobody has joined yet.</p> : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-xs text-slate-400"><tr><th className="p-2">Trainee</th><th className="p-2">Solved</th><th className="p-2">Failed checks</th><th className="p-2">Hints</th><th className="p-2">Last active</th><th className="p-2">Checkpoint</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.email} className="border-t border-slate-800">
                <td className="p-2"><div className="font-semibold">{r.name}</div><div className="text-xs text-slate-500">{r.email}</div></td>
                <td className="p-2">{r.solved}/{r.total}</td><td className="p-2">{r.failed}</td><td className="p-2">{r.hints}</td>
                <td className="p-2 text-slate-400">{r.last ? r.last.toLocaleDateString() : "—"}</td><td className="p-2 text-xs">{r.exam || "—"}</td>
              </tr>))}</tbody>
          </table>
        </div>)}
    </div>
  );
}
