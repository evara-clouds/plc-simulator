"use client";
import { useState } from "react";

const PROGRAMS = ["Industrial maintenance", "Mechatronics", "Electrical", "Automation and PLCs", "High school CTE", "Other"];
const SIZES = ["Under 5", "5 to 10", "11 to 25", "26 to 100", "Over 100"];
const input = "w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none";

export default function QuoteForm({ kind, email }) {
  const [state, setState] = useState("idle");
  const schools = kind === "schools";

  async function onSubmit(e) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    data.kind = kind;
    try {
      const r = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setState(r.ok ? "sent" : "error");
    } catch { setState("error"); }
  }

  if (state === "sent") return <p className="rounded-lg border border-cyan-800 bg-cyan-950/30 p-4 text-sm text-cyan-200">Thanks. We will reply by email within one business day.</p>;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <input name="name" required placeholder="Your name" className={input} />
      <input name="email" type="email" required placeholder={schools ? "School email" : "Work email"} className={input} />
      <input name="org" required placeholder={schools ? "School or college" : "Company and site"} className={input} />
      {schools ? (
        <select name="program" required defaultValue="" className={input}>
          <option value="" disabled>Program</option>{PROGRAMS.map((p) => <option key={p}>{p}</option>)}
        </select>
      ) : (
        <select name="size" required defaultValue="" className={input}>
          <option value="" disabled>People to train</option>{SIZES.map((p) => <option key={p}>{p}</option>)}
        </select>
      )}
      {schools && <input name="students" placeholder="Students per year" className={input} />}
      {schools && <input name="start" placeholder="When you'd start (optional)" className={input} />}
      <textarea name="notes" rows={3} placeholder={schools ? "Anything we should know? (optional)" : "What do you want them to be able to do? (optional)"} className={`${input} sm:col-span-2`} />
      <button disabled={state === "sending"} className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60 sm:col-span-2">
        {state === "sending" ? "Sending…" : schools ? "Request a quote" : "Send"}
      </button>
      {state === "error" && <p className="text-sm text-red-400 sm:col-span-2">Could not send. {email ? `Please email ${email} instead.` : "Please try again."}</p>}
    </form>
  );
}
