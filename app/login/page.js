"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
export default function Login() {
  const [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const r = await signIn("credentials", { email: f.get("email"), password: f.get("password"), redirect: false });
    if (r?.error) setErr("Invalid email or password"); else window.location.href = "/problems";
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-cyan-400">Log in</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <input name="email" type="email" placeholder="Email" required className="inp" />
      <input name="password" type="password" placeholder="Password" required className="inp" />
      <button className="btn w-full">Log in</button>
      <p className="text-sm text-slate-400">New here? <Link href="/register" className="text-cyan-400">Sign up</Link></p>
    </form>
  );
}
