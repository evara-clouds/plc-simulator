export const card = "rounded-xl border border-slate-800 bg-slate-900 p-5";
const btn = "rounded-lg bg-cyan-600 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-500";

export function Hero({ title, lead, links }) {
  return (
    <section className="space-y-4 py-8">
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
      <p className="max-w-3xl text-lg text-slate-300">{lead}</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <a href={links[0][1]} className={btn}>{links[0][0]}</a>
        <a href={links[1][1]} className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-500">{links[1][0]}</a>
      </div>
      <p className="text-sm text-slate-500">Runs in the browser, on any computer. Nothing to install.</p>
    </section>
  );
}

export function Section({ id, title, intro, children }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4 py-8">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {intro && <p className="max-w-3xl text-slate-400">{intro}</p>}
      {children}
    </section>
  );
}

export function Cards({ items, cols = "sm:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {items.map(([t, b]) => (
        <div key={t} className={card}>
          <h3 className="mb-2 font-semibold text-white">{t}</h3>
          <p className="text-sm text-slate-400">{b}</p>
        </div>
      ))}
    </div>
  );
}

export function Tracks({ items }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {items.map(([t, s], i) => (
        <li key={t} className="flex gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-950 text-sm font-bold text-cyan-300">{i + 1}</span>
          <div><div className="font-semibold text-white">{t}</div><div className="text-sm text-slate-400">{s}</div></div>
        </li>
      ))}
    </ol>
  );
}

export function Price({ name, who, price, points, featured }) {
  return (
    <div className={`rounded-xl border p-6 ${featured ? "border-cyan-800 bg-cyan-950/30" : "border-slate-800 bg-slate-900"}`}>
      <h3 className="text-xl font-bold text-white">{name}</h3>
      <p className="text-sm text-slate-400">{who}</p>
      <p className="mt-1 text-lg font-semibold text-cyan-300">{price}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">{points.map((p) => <li key={p} className="flex gap-2"><span className="text-cyan-400">✓</span><span>{p}</span></li>)}</ul>
      <a href="#request" className={`${btn} mt-6 inline-block py-2.5`}>Contact us for a quote</a>
    </div>
  );
}

export function Faq({ items }) {
  return (
    <div className="space-y-5">
      {items.map(([q, a]) => (
        <div key={q}><h3 className="font-semibold text-white">{q}</h3><p className="mt-1 text-sm text-slate-400">{a}</p></div>
      ))}
    </div>
  );
}
