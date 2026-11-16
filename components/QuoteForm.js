"use client";
import { useEffect, useState } from "react";
import { COURSE } from "@/lib/course";

const SIZES = ["Under 5", "5 to 10", "11 to 25", "26 to 100", "Over 100"];
const DEVICES = ["Every trainee has a laptop", "Trainees share laptops", "No laptops yet"];
const NETWORK = ["Reliable internet in the room", "Slow or unreliable internet", "No internet in the room"];
const PROGRAMMES = ["Full automation course", ...COURSE.topics.map((t) => t[0]).filter((t) => t !== "And many more"), "Not sure yet"];
const input = "w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none";

// One form for every "Request a pilot" button: a pilot is an in-person (physical) class.
export default function QuoteForm({ kind = "pilot", email, venue }) {
  const [state, setState] = useState("idle");
  const [audience, setAudience] = useState("");
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("for"); if (f === "student" || f === "company") setAudience(f); }, []);

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

  if (state === "sent") return <p className="rounded-lg border border-cyan-800 bg-cyan-950/30 p-4 text-sm text-cyan-200">Thanks. We will contact you to agree the class dates.</p>;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <input name="name" required placeholder="Your name" className={input} />
      <input name="email" type="email" required placeholder="Email" className={input} />
      <input name="phone" placeholder="Phone or WhatsApp, e.g. +254 7XX XXX XXX (optional)" className={input} />
      <select name="audience" required value={audience} onChange={(e) => setAudience(e.target.value)} className={input}>
        <option value="" disabled>I am booking as</option><option value="student">A student</option><option value="company">A company</option>
      </select>
      <input name="org" required placeholder={audience === "student" ? "School or employer (or none)" : "Company or organisation"} className={input} />
      <select name="program" required defaultValue="" className={`${input} sm:col-span-2`}>
        <option value="" disabled>Programme you want</option>{PROGRAMMES.map((p) => <option key={p}>{p}</option>)}
      </select>
      <select name="size" required defaultValue="" className={input}>
        <option value="" disabled>{audience === "student" ? "Number of people attending" : "Number of trainees"}</option>{SIZES.map((p) => <option key={p}>{p}</option>)}
      </select>
      <input name="venue" defaultValue={venue || ""} placeholder="Where the class takes place" className={input} />
      <input name="start" placeholder="Preferred start date (optional)" className={input} />
      <select name="devices" required defaultValue="" className={input}>
        <option value="" disabled>Laptops in the room</option>{DEVICES.map((p) => <option key={p}>{p}</option>)}
      </select>
      <select name="network" required defaultValue="" className={input}>
        <option value="" disabled>Internet in the room</option>{NETWORK.map((p) => <option key={p}>{p}</option>)}
      </select>
      <textarea name="notes" rows={3} placeholder="Anything we should know? (optional)" className={`${input} sm:col-span-2`} />
      <button disabled={state === "sending"} className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60 sm:col-span-2">
        {state === "sending" ? "Sending…" : "Request a pilot"}
      </button>
      {state === "error" && <p className="text-sm text-red-400 sm:col-span-2">Could not send. {email ? `Please email ${email} instead.` : "Please try again."}</p>}
      <p className="text-xs text-slate-500 sm:col-span-2">We use this only to reply to you and plan the class.</p>
    </form>
  );
}
