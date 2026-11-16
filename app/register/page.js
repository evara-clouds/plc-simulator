import Link from "next/link";
import { register } from "@/app/actions";
export default function Register({ searchParams }) {
  const company = searchParams.type === "company";
  const type = company ? "company" : "student";
  const tab = (t, label) => (
    <Link href={`/register?type=${t}`} className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold ${type === t ? "bg-cyan-600 text-white" : "border border-slate-700 text-slate-300 hover:border-cyan-500"}`}>{label}</Link>
  );
  return (
    <form action={register} className="mx-auto mt-10 max-w-sm space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex gap-2">{tab("student", "Student")}{tab("company", "Company")}</div>
      <h1 className="text-xl font-bold text-cyan-400">{company ? "Create company account" : "Create student account"}</h1>
      {searchParams.error && <p className="text-sm text-red-400">{searchParams.error}</p>}
      <input type="hidden" name="type" value={type} />
      <input name="name" placeholder={company ? "Your name" : "Name"} required className="inp" />
      {company && <input name="company" placeholder="Company name" required className="inp" />}
      <input name="email" type="email" placeholder={company ? "Work email" : "Email"} required className="inp" />
      <input name="password" type="password" placeholder="Password (min 8)" minLength={8} required className="inp" />
      {process.env.SIGNUP_CODE ? <input name="code" placeholder="Invite code" required className="inp" /> : null}
      {company && <p className="text-xs text-slate-400">Team tools (classes and a progress view) are switched on once your pilot is agreed. <Link href="/contact?for=company#pilot" className="text-cyan-400">Request a pilot</Link>.</p>}
      <button className="btn w-full">Sign up</button>
      <p className="text-sm text-slate-400">Have an account? <Link href={`/login?type=${type}`} className="text-cyan-400">Log in</Link></p>
    </form>
  );
}
