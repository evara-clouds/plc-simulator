import Link from "next/link";
import { getUser } from "@/lib/auth";
import { joinClass } from "@/app/actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Join a class · PLC Practice Companion" };

export default async function Join({ searchParams }) {
  const u = await getUser();
  return (
    <div className="mx-auto max-w-md space-y-4 py-6">
      <h1 className="text-2xl font-bold text-cyan-400">Join a class</h1>
      {!u ? <p className="text-sm text-slate-300"><Link href="/login" className="text-cyan-400">Log in</Link> first, then enter the code from your trainer.</p> : (
        <form action={joinClass} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <input name="code" placeholder="Class code, e.g. 3F9A1C" required className="inp font-mono uppercase" />
          <button className="btn w-full">Join</button>
          <p className="text-xs text-slate-400">Your trainer will be able to see your name, email, progress and checkpoint results for this class.</p>
        </form>)}
      {searchParams.error && <p className="text-sm text-red-400">{searchParams.error}</p>}
      {searchParams.joined && <p className="text-sm text-emerald-400">✓ You joined {searchParams.joined}.</p>}
    </div>
  );
}
