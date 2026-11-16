import Link from "next/link";
import { getUser } from "@/lib/auth";
import { SITE, pilotHref } from "@/lib/site";

const COLS = [
  ["Learn", [["How it works", "/#how"], ["Problems", "/problems"], ["The lab", "/lab"], ["Checkpoints", "/exam"], ["Community", "/community"]]],
  ["Organisations", [["For trainers and schools", "/schools"], ["For employers", "/employers"], ["Join a class", "/join"], ["Request a pilot", null], ["Data and security", "/data-and-security"]]],
  ["Company", [["About", "/about"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]]],
];

export default async function Footer() {
  const u = await getUser();
  const link = "text-slate-400 hover:text-cyan-400";
  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto grid max-w-[1800px] gap-8 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 text-sm">
          <div className="text-lg font-bold text-cyan-400">{SITE.name}</div>
          <p className="text-slate-400">Practise PLC programming before the lab.</p>
          {process.env.NEXT_PUBLIC_OPERATOR && <p className="text-xs text-slate-500">Operated by {SITE.operator}</p>}
          {SITE.email && <a href={`mailto:${SITE.email}`} className={`block text-xs ${link}`}>{SITE.email}</a>}
        </div>
        {COLS.map(([h, items]) => (
          <div key={h} className="space-y-2 text-sm">
            <div className="font-semibold text-slate-200">{h}</div>
            <ul className="space-y-1">{items.map(([t, href]) => <li key={t}>{href ? <Link href={href} className={link}>{t}</Link> : <a href={pilotHref()} className={link}>{t}</a>}</li>)}</ul>
          </div>))}
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3 p-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span className="flex flex-wrap gap-4">{!u && <Link href="/login" className={link}>Sign in</Link>}<Link href="/verify" className={link}>Verify a badge</Link></span>
        </div>
      </div>
    </footer>
  );
}
