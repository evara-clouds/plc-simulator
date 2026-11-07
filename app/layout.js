import "./globals.css";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import SignOut from "@/components/SignOut";

export const metadata = { title: "PLC & HMI Simulator" };

export default async function RootLayout({ children }) {
  const u = await getUser();
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-2 p-3">
            <div className="flex items-center gap-5">
              <Link href="/" className="text-lg font-bold text-cyan-400">PLC·HMI Sim</Link>
              <Link href="/problems" className="text-sm text-slate-300 hover:text-cyan-400">Problems</Link>
              <Link href="/community" className="text-sm text-slate-300 hover:text-cyan-400">Community</Link>
              {u && <Link href="/projects" className="text-sm text-slate-300 hover:text-cyan-400">Projects</Link>}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {u ? (<><span className="hidden text-slate-400 sm:inline">{u.name}</span><SignOut /></>) : (
                <><Link className="btn2" href="/login">Log in</Link><Link className="btn" href="/register">Sign up</Link></>)}
            </div>
          </div>
        </nav>
        <main className="mx-auto w-full max-w-[1800px] p-3 sm:p-4">{children}</main>
      </body>
    </html>
  );
}
