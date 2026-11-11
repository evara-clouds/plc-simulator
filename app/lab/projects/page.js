import Link from "next/link";
import { PROBLEMS } from "@/lib/problems";
export const metadata = { title: "Industrial projects · PLC Practice Companion" };
export default function Projects() {
  const list = PROBLEMS.filter((p) => p.id.startsWith("pr") && p.industry);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold text-cyan-400">Industrial projects</h1>
      <p className="text-sm text-slate-400">Five complete plants, each with a live scene. Read the spec, build the whole program, and check it against the plant’s behaviour.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((p) => (
          <div key={p.id} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs font-bold text-amber-400">{p.industry.toUpperCase()}</div>
            <h2 className="font-bold">{p.title}</h2>
            <p className="text-sm text-slate-400">{p.skills}</p>
            <p className="text-xs text-slate-500">{p.inputs.length} inputs · {p.outputs.length} outputs</p>
            <Link href={`/lab?problem=${p.id}`} className="btn inline-block">Open project</Link>
          </div>))}
      </div>
    </div>
  );
}
