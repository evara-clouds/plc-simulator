import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { saveReview, deleteReview } from "@/app/actions";
import Link from "next/link";

const Stars = ({ n }) => <span className="whitespace-nowrap text-amber-400" title={`${n} out of 5`}>{"★".repeat(n)}<span className="text-slate-700">{"★".repeat(5 - n)}</span></span>;
const LABEL = { 5: "Excellent", 4: "Good", 3: "Okay", 2: "Poor", 1: "Bad" };

export default async function Reviews() {
  const u = await getUser();
  let list = [], agg = null, dist = [], mine = null, ready = true;
  try {
    [list, agg, dist, mine] = await Promise.all([
      prisma.review.findMany({ orderBy: { updatedAt: "desc" }, take: 30, include: { user: { select: { name: true } } } }),
      prisma.review.aggregate({ _avg: { rating: true }, _count: { _all: true } }),
      prisma.review.groupBy({ by: ["rating"], _count: { _all: true } }),
      u ? prisma.review.findUnique({ where: { userId: u.id } }) : null,
    ]);
  } catch { ready = false; }
  const total = agg?._count?._all || 0, avg = agg?._avg?.rating || 0;
  const by = Object.fromEntries(dist.map((d) => [d.rating, d._count._all]));

  return (
    <section className="space-y-3">
      <h2 className="border-b border-slate-800 pb-2 text-xl font-bold">Reviews</h2>
      {!ready ? <p className="text-sm text-slate-500">Reviews are not set up yet. Stop the server and run <code>npx prisma db push</code>.</p> : (
        <>
          <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:grid-cols-[10rem_1fr]">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{total ? avg.toFixed(1) : "–"}</div>
              <Stars n={Math.round(avg)} />
              <div className="mt-1 text-xs text-slate-400">{total} review{total === 1 ? "" : "s"}</div>
            </div>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-slate-400">{s} ★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-slate-800"><div className="h-full bg-amber-400" style={{ width: `${total ? (100 * (by[s] || 0)) / total : 0}%` }} /></div>
                  <span className="w-6 text-right text-slate-400">{by[s] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {u ? (
            <form action={saveReview} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="font-semibold">{mine ? "Update your review" : "Leave a review"}</div>
              <select name="rating" defaultValue={mine?.rating || 5} className="inp w-48">
                {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{"★".repeat(s)}  {s} – {LABEL[s]}</option>)}
              </select>
              <textarea name="body" rows={3} maxLength={600} defaultValue={mine?.body || ""} placeholder="What did you like? What could be better? (optional, 600 characters)" className="inp" />
              <div className="flex gap-2">
                <button className="btn">{mine ? "Update review" : "Post review"}</button>
              </div>
            </form>
          ) : <p className="text-sm text-slate-400"><Link href="/login" className="text-cyan-400">Log in</Link> to leave a review.</p>}
          {mine && <form action={deleteReview}><button className="text-xs text-red-400 hover:underline">Delete my review</button></form>}

          {list.length === 0 && <p className="text-sm text-slate-500">No reviews yet. Be the first!</p>}
          <div className="space-y-2">
            {list.map((r) => (
              <div key={r.id} className={`space-y-1 rounded-xl border bg-slate-900 p-3 ${u && r.userId === u.id ? "border-cyan-700" : "border-slate-800"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span><b className="text-sm text-slate-200">{r.user.name}</b>{u && r.userId === u.id ? <span className="ml-2 text-cyan-400">(you)</span> : null}</span>
                  <span className="text-slate-500">{r.updatedAt.toLocaleDateString()}</span>
                </div>
                <Stars n={r.rating} />
                {r.body && <p className="whitespace-pre-wrap text-sm text-slate-300">{r.body}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
