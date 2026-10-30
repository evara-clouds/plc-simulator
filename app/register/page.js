import Link from "next/link";
import { register } from "@/app/actions";
export default function Register({ searchParams }) {
  return (
    <form action={register} className="mx-auto mt-10 max-w-sm space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-cyan-400">Create account</h1>
      {searchParams.error && <p className="text-sm text-red-400">{searchParams.error}</p>}
      <input name="name" placeholder="Name" required className="inp" />
      <input name="email" type="email" placeholder="Email" required className="inp" />
      <input name="password" type="password" placeholder="Password (min 8)" minLength={8} required className="inp" />
      <button className="btn w-full">Sign up</button>
      <p className="text-sm text-slate-400">Have an account? <Link href="/login" className="text-cyan-400">Log in</Link></p>
    </form>
  );
}
