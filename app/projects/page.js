import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { deleteProject, setPublic } from "@/app/actions";
export const dynamic = "force-dynamic";

export default async function Projects() {
  const u = await getUser();
  if (!u) redirect("/login");
  const mine = await prisma.project.findMany({ where: { userId: u.id }, orderBy: { updatedAt: "desc" } });
  const shared = await prisma.project.findMany({ where: { isPublic: true, NOT: { userId: u.id } }, orderBy: { updatedAt: "desc" }, include: { user: { select: { name: true } } } });
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-cyan-400">My projects</h1>
        {mine.length === 0 && <p className="text-slate-500">Nothing saved yet. Build something on the Simulator and press Save.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((p) => (
            <div key={p.id} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="font-bold">{p.title} {p.isPublic && <span className="ml-1 rounded bg-cyan-900 px-1.5 text-[10px] text-cyan-300">PUBLIC</span>}</div>
              <div className="text-xs text-slate-400">Updated {p.updatedAt.toLocaleString()}</div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/?project=${p.id}`} className="btn">Open</Link>
                <form action={setPublic}><input type="hidden" name="id" value={p.id} /><button className="btn2">{p.isPublic ? "Unpublish" : "Share to community"}</button></form>
                <form action={deleteProject}><input type="hidden" name="id" value={p.id} /><button className="btn2 text-red-400">Delete</button></form>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-cyan-400">Shared by the community</h2>
        {shared.length === 0 && <p className="text-slate-500">No shared projects yet.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shared.map((p) => (
            <div key={p.id} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="font-bold">{p.title}</div>
              <div className="text-xs text-slate-400">by {p.user.name}</div>
              <Link href={`/?project=${p.id}`} className="btn inline-block">Open (saves as your copy)</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
