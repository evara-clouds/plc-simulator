"use client";
import { useState } from "react";

const SIZES = ["Under 5", "5 to 10", "11 to 25", "26 to 100", "Over 100"];
const DEVICES = ["Every trainee has a laptop", "Trainees share laptops", "No laptops yet"];
const NETWORK = ["Reliable internet in the room", "Slow or unreliable internet", "No internet in the room"];
const input = "w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none";

// One form for every "Request a pilot" button: a pilot is an in-person (physical) class.
export default function QuoteForm({ kind = "pilot", email, venue }) {
  const [state, setState] = useState("idle");

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
      <input name="org" required placeholder="Organisation" className={input} />
      <input name="course" required placeholder="Course or class (for example PLC basics)" className={input} />
      <select name="size" required defaultValue="" className={input}>
        <option value="" disabled>Number of trainees</option>{SIZES.map((p) => <option key={p}>{p}</option>)}
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
