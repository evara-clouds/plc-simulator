"use client";
import { useEffect, useState } from "react";
import { ADDR, GROUPS, deriveTags, validName } from "@/lib/sim";
const typeOf = (k, v, meta) => meta.userTags.find((u) => u.name === k)?.type || (typeof v === "boolean" ? "Bool" : typeof v === "string" ? "String" : Number.isInteger(v) ? "Int" : "Real");
const inp = "rounded border border-slate-700 bg-slate-950 px-1 text-xs";

export default function TagTable({ tags, setTags, prob, rungs, meta, setMeta }) {
  const [nm, setNm] = useState(""), [ty, setTy] = useState("Bool"), [err, setErr] = useState("");
  useEffect(() => {   // user tags always exist in the PLC state (also after Reset / opening a project)
    setTags((p) => { let q = p; for (const u of meta.userTags) if (!(u.name in q)) q = { ...q, [u.name]: u.type === "Bool" ? false : 0 }; return q; });
  }, [meta.userTags, setTags]);
  const user = meta.userTags.map((u) => u.name), blocks = deriveTags(rungs);
  const groups = [
    ...(prob?.tags ? [["Inputs", prob.inputs], ["Outputs", prob.outputs], ["Memory", Object.keys(tags).filter((k) => k[0] !== "_" && !prob.inputs.includes(k) && !prob.outputs.includes(k) && !user.includes(k) && !blocks.includes(k))]] : GROUPS),
    ["User tags", user], ["Block data", blocks.filter((k) => !user.includes(k))],
  ].filter(([, n]) => n.length);
  const addr = (k, g, i) => ADDR[k] || (g === "Inputs" ? "%I0." + i : g === "Outputs" ? "%Q0." + i : g === "User tags" ? (typeOf(k, tags[k], meta) === "Bool" ? "%M1." : "%MW") + i : "—");
  const set = (k, v) => setTags((p) => ({ ...p, [k]: v }));
  const add = () => {
    if (!validName(nm)) return setErr("Use letters, digits and _ (start with a letter, not a reserved word).");
    if (nm in tags || user.includes(nm) || blocks.includes(nm)) return setErr("That name already exists.");
    setMeta({ ...meta, userTags: [...meta.userTags, { name: nm, type: ty }] }); setNm(""); setErr("");
  };
  const val = (k, v, g) => typeof v === "number" ? <input type="number" value={v} onChange={(e) => set(k, Number(e.target.value))} className={`w-20 ${inp}`} />
    : k === "MODE" ? <button className="btn2 !py-0 text-xs" onClick={() => set(k, v === "AUTO" ? "MANUAL" : "AUTO")}>{v}</button>
    : typeof v === "boolean" && (g === "Inputs" || g === "User tags") ? <button onClick={() => set(k, !v)} className={`w-8 rounded ${v ? "bg-emerald-600" : "bg-slate-700"}`}>{v ? 1 : 0}</button>
    : <span className={v ? "text-emerald-400" : "text-slate-500"}>{String(v ? (typeof v === "boolean" ? 1 : v) : 0)}</span>;
  return (
    <div className="space-y-3 text-xs">
      <div className="overflow-x-auto"><table className="w-full text-left font-mono">
        <thead><tr className="border-b border-slate-700 text-slate-400"><th className="p-1">Name</th><th className="p-1">Data type</th><th className="p-1">Address</th><th className="p-1">Comment</th><th className="p-1">Value</th></tr></thead>
        <tbody>{groups.flatMap(([g, names]) => [
          <tr key={g}><td colSpan={5} className="bg-slate-800/60 px-1 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">{g}</td></tr>,
          ...names.map((k, i) => (
            <tr key={g + k} className="border-b border-slate-800">
              <td className="p-1">{k}{g === "User tags" && <button className="ml-2 text-red-400" onClick={() => setMeta({ ...meta, userTags: meta.userTags.filter((u) => u.name !== k) })}>×</button>}</td>
              <td className="p-1 text-cyan-400">{typeOf(k, tags[k], meta)}</td>
              <td className="p-1 text-slate-400">{addr(k, g, i)}</td>
              <td className="p-1"><input value={meta.comments[k] || ""} placeholder="comment…" onChange={(e) => setMeta({ ...meta, comments: { ...meta.comments, [k]: e.target.value } })} className={`w-40 ${inp}`} /></td>
              <td className="p-1">{val(k, tags[k], g)}</td>
            </tr>)),
        ])}</tbody>
      </table></div>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3">
        <b className="text-cyan-400">Add tag</b>
        <input value={nm} onChange={(e) => setNm(e.target.value.replace(/\W/g, ""))} placeholder="Name" className={`w-32 ${inp}`} />
        <select value={ty} onChange={(e) => setTy(e.target.value)} className={inp}>{["Bool", "Int", "Real"].map((x) => <option key={x}>{x}</option>)}</select>
        <button className="btn2 !py-0.5" onClick={add}>Add</button>{err && <span className="text-red-400">{err}</span>}
      </div>
    </div>
  );
}
