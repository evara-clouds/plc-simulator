"use client";
import { useEffect, useState } from "react";
import { signIn, getSession } from "next-auth/react";
export default function Login() {
  const [err, setErr] = useState("");
  const [type, setType] = useState("student");
  useEffect(() => { setType(new URLSearchParams(window.location.search).get("type") === "company" ? "company" : "student"); }, []);
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const r = await signIn("credentials", { email: f.get("email"), password: f.get("password"), redirect: false });
    if (r?.error) { setErr("Invalid email or password"); return; }
    const s = await getSession();
    window.location.href = s?.user?.type === "company" ? "/trainer" : "/problems";
  }
  const company = type === "company";
  const tab = (t, label) => (
    <a href={`/login?type=${t}`} className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold ${type === t ? "bg-cyan-600 text-white" : "border border-slate-700 text-slate-300 hover:border-cyan-500"}`}>{label}</a>
  );
  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex gap-2">{tab("student", "Student")}{tab("company", "Company")}</div>
      <h1 className="text-xl font-bold text-cyan-400">{company ? "Company log in" : "Student log in"}</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <input name="email" type="email" placeholder={company ? "Work email" : "Email"} required className="inp" />
      <input name="password" type="password" placeholder="Password" required className="inp" />
      <button className="btn w-full">Log in</button>
      <p className="text-sm text-slate-400">New here? <a href={`/register?type=${type}`} className="text-cyan-400">Sign up</a></p>
    </form>
  );
}
