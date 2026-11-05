import Link from "next/link";
import Reviews from "@/components/Reviews";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { PROBLEMS } from "@/lib/problems";
import { newPost, newComment, toggleLike } from "@/app/actions";
export const dynamic = "force-dynamic";
const COL = { Easy: "text-emerald-400", Medium: "text-amber-400", Hard: "text-red-400" };

export default async function Community({ searchParams }) {
  const u = await getUser();
  const level = ["Easy", "Medium", "Hard"].includes(searchParams.level) ? searchParams.level : "";
  const prob = PROBLEMS.find((p) => p.id === searchParams.problem);
  const top = searchParams.sort === "top";
  const ids = prob ? [prob.id] : level ? PROBLEMS.filter((p) => p.level === level).map((p) => p.id) : null;
  const [shared, posts, mine] = await Promise.all([
    prisma.project.findMany({
      where: { isPublic: true, ...(ids ? { problemId: { in: ids } } : {}) }, take: 24,
      orderBy: top ? [{ likes: { _count: "desc" } }, { updatedAt: "desc" }] : { updatedAt: "desc" },
      include: { user: { select: { name: true } }, _count: { select: { likes: true } } },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" }, take: 30,
      include: { user: { select: { name: true } }, comments: { orderBy: { createdAt: "asc" }, take: 50, include: { user: { select: { name: true } } } } },
    }),
    u ? prisma.like.findMany({ where: { userId: u.id }, select: { projectId: true } }) : [],
  ]);
  const liked = new Set(mine.map((l) => l.projectId));
  const q = (o) => { const s = String(new URLSearchParams(Object.entries({ level, sort: top ? "top" : "", problem: prob?.id || "", ...o }).filter(([, v]) => v))); return s ? `/community?${s}` : "/community"; };
  const chip = (on) => `rounded-full border px-3 py-1 text-xs ${on ? "border-cyan-500 bg-cyan-900/40 text-cyan-200" : "border-slate-700 text-slate-400 hover:text-white"}`;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold text-cyan-400">Community</h1>

      <section className="space-y-3">
        <h2 className="border-b border-slate-800 pb-2 text-xl font-bold">Shared projects &amp; solutions</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={q({ level: "", problem: "" })} className={chip(!level && !prob)}>All</Link>
          {["Easy", "Medium", "Hard"].map((l) => <Link key={l} href={q({ level: l, problem: "" })} className={chip(level === l && !prob)}>{l}</Link>)}
          <span className="mx-2 text-slate-600">|</span>
          <Link href={q({ sort: "" })} className={chip(!top)}>Newest</Link>
          <Link href={q({ sort: "top" })} className={chip(top)}>Most liked</Link>
          {prob && <Link href={q({ problem: "" })} className={chip(true)}>Problem: {prob.title} ✕</Link>}
        </div>
        {shared.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing here yet. Solve a problem in the simulator and press <b>Share</b>.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shared.map((p) => {
              const pr = PROBLEMS.find((x) => x.id === p.problemId);
              return (
                <div key={p.id} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-cyan-600">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-slate-200">{p.title}</div>
                    {p.solved && <span className="shrink-0 rounded bg-emerald-900 px-1.5 py-0.5 text-[10px] text-emerald-300">✓ ALL TESTS PASSED</span>}
                  </div>
                  {pr ? <div className="text-xs"><span className={COL[pr.level]}>{pr.level}</span> · <Link href={`/?problem=${pr.id}`} className="text-cyan-400">{pr.title}</Link></div>
                    : <div className="text-xs text-slate-500">Free build</div>}
                  <div className="text-xs text-slate-400">by {p.user.name} · {p.updatedAt.toLocaleDateString()}</div>
                  <div className="flex items-center gap-2">
                    <Link href={`/?project=${p.id}`} className="btn flex-1 text-center">Open</Link>
                    {u ? <form action={toggleLike}><input type="hidden" name="id" value={p.id} /><button className="btn2">{liked.has(p.id) ? "♥" : "♡"} {p._count.likes}</button></form>
                      : <span className="text-xs text-slate-400">♡ {p._count.likes}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Reviews />


      <section className="space-y-3">
        <h2 className="border-b border-slate-800 pb-2 text-xl font-bold">Discussions</h2>
        {u ? (
          <form action={newPost} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <input name="title" placeholder="Title" required className="inp" />
            <textarea name="body" placeholder="Ask a question or share a tip…" required rows={3} className="inp" />
            <button className="btn">Post</button>
          </form>
        ) : <p className="text-sm text-slate-400"><Link href="/login" className="text-cyan-400">Log in</Link> to post, comment and like.</p>}
        {posts.length === 0 && <p className="text-slate-500">No posts yet. Start the conversation!</p>}
        {posts.map((p) => (
          <div key={p.id} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="font-bold">{p.title}</div>
            <div className="text-xs text-slate-400">{p.user.name} · {p.createdAt.toLocaleString()}</div>
            <p className="whitespace-pre-wrap text-sm">{p.body}</p>
            <div className="space-y-1 border-t border-slate-800 pt-2">
              {p.comments.map((c) => <p key={c.id} className="text-sm"><b className="text-cyan-400">{c.user.name}:</b> {c.body}</p>)}
              {u && <form action={newComment} className="flex gap-2"><input type="hidden" name="postId" value={p.id} />
                <input name="body" placeholder="Write a comment…" required className="inp" /><button className="btn2">Reply</button></form>}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
