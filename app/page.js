import Link from "next/link";
import { SITE, pilotHref } from "@/lib/site";
export const metadata = { title: `${SITE.name}: practise PLC programming in your browser`, description: "Build ladder logic, watch live machines respond, get instant feedback and earn a verifiable badge. Nothing to install.",
  openGraph: { title: `${SITE.name}: practise PLC programming in your browser`, description: "Build ladder logic, watch live machines respond and prove your skills.", type: "website" } };
const WHO = [["Learners", "Practise at your own pace with live scenes, hints and progress tracking, on any device with a browser."], ["Trainers & schools", "Create a class, share a code, and see who is stuck. Trainees practise before and after lab sessions."], ["Employers", "Give technicians practice without tying up equipment, then see what each person has proved."]];
const STEPS = [["1  Learn", "Short problems that build one idea at a time: contacts, seal-in circuits, interlocks, timers and counters."], ["2  Practice", "Build the ladder logic and watch a live garage door, tank or traffic light react. Instant checking, with hints that unlock as you try."], ["3  Prove", "A checkpoint with hidden tests and no hints. Pass it and earn a badge anyone can verify with a code."]];
const FAQ = [["Do I need a PLC or any software?", "No. It runs in your browser, with a built-in ladder editor and simulated machines."], ["Which PLC brand does it teach?", "The ladder-logic ideas are the same across IEC 61131-3 PLCs, so the skills carry over. It is not tied to one brand."], ["What device do I need?", "A recent laptop, tablet or phone with a browser. The scenes are lightweight 2D, so older machines and slow connections work."], ["What data do you store?", "Your name, email, a hashed password, your saved work and your progress. Read the Data and security page for details."], ["How does a trainer use it?", "A trainer creates a class, shares the code, and sees each trainee's progress and exam results."], ["What does a pilot look like?", "Typically a five day program with 75% practical, certification, one cohort and one trainer. Request a pilot and we will agree the details."]];
export default function Home() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 py-8">
      <section className="space-y-5 text-center">
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Practise PLC programming <span className="text-cyan-400">before the lab.</span></h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-300">Build ladder logic in your browser, watch live machines respond, and prove your skills with a verifiable badge.</p>
        <div className="flex flex-wrap justify-center gap-3"><Link href="/lab" className="btn">Try the lab</Link><a href={pilotHref()} className="btn2 !px-4 !py-2">Request a pilot</a></div>
        <p className="text-xs text-slate-500">Runs in your browser. Nothing to install.</p>
      </section>
      <section className="space-y-4"><h2 className="text-center text-2xl font-bold">Who it is for</h2>
        <div className="grid gap-4 sm:grid-cols-3">{WHO.map(([t, d]) => <div key={t} className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h3 className="mb-2 font-bold text-cyan-400">{t}</h3><p className="text-sm text-slate-300">{d}</p></div>)}</div></section>
      <section className="space-y-4"><h2 className="text-center text-2xl font-bold">Learn it, practise it, prove it</h2>
        <div className="grid gap-4 sm:grid-cols-3">{STEPS.map(([t, d]) => <div key={t} className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h3 className="mb-2 text-lg font-bold text-amber-400">{t}</h3><p className="text-sm text-slate-300">{d}</p></div>)}</div></section>
      {SITE.demo && <section className="space-y-3"><h2 className="text-center text-2xl font-bold">See it in action</h2><video src={SITE.demo} controls preload="metadata" className="mx-auto w-full max-w-3xl rounded-xl border border-slate-800" /></section>}
      <section className="mx-auto max-w-3xl space-y-2"><h2 className="text-center text-2xl font-bold">Questions</h2>
        {FAQ.map(([q, a]) => <details key={q} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-sm text-slate-300">{a}</p></details>)}</section>
      <section className="space-y-3 rounded-2xl border border-cyan-800 bg-slate-900 p-8 text-center"><h2 className="text-2xl font-bold">Run a pilot with your team or class</h2><p className="text-slate-300">One cohort, one trainer and a five day program. We measure practice time, completion and feedback.</p><a href={pilotHref()} className="btn inline-block">Request a pilot</a></section>
    </div>
  );
}
