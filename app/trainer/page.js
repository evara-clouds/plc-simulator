import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { isTrainer } from "@/lib/trainer";
import { createClass } from "@/app/actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Trainer · PLC Practice Companion" };

export default async function Trainer() {
  const u = await getUser();
  if (!u) redirect("/login");
  if (!isTrainer(u)) return <p className="mx-auto max-w-md py-8 text-slate-300">Trainer tools are only available to approved trainers. Ask the site owner to add your email to the trainer list.</p>;
  const classes = await prisma.class.findMany({ where: { ownerId: u.id }, orderBy: { createdAt: "desc" }, include: { _count: { select: { enrollments: true } } } });
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-cyan-400">Trainer</h1>
      <form action={createClass} className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4"><input name="name" placeholder="New class name, e.g. PLC Level 1 · Nov intake" required className="inp" /><button className="btn">Create class</button></form>
      {classes.length === 0 && <p className="text-slate-500">No classes yet.</p>}
      {classes.map((c) => (
        <Link key={c.id} href={`/trainer/${c.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-cyan-600">
          <span className="font-bold">{c.name}</span>
          <span className="text-sm text-slate-400">{c._count.enrollments} trainee{c._count.enrollments === 1 ? "" : "s"} · class code <b className="font-mono text-amber-400">{c.code}</b></span>
        </Link>))}
    </div>
  );
}
