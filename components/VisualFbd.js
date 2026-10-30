"use client";
import { useState } from "react";
import { ALIAS } from "@/lib/sim";

const PALETTE = {
  Favorites: [
    { t: "AND", l: "& AND", ins: 2 },
    { t: "OR", l: ">=1 OR", ins: 2 },
    { t: "SR", l: "SR Latch", ins: 2 },
    { t: "TON", l: "TON Timer", ins: 1 }
  ],
  Bit: [
    { t: "AND", l: "& AND", ins: 2 },
    { t: "OR", l: ">=1 OR", ins: 2 },
    { t: "NOT", l: "NOT", ins: 1 },
    { t: "XOR", l: "=1 XOR", ins: 2 }
  ]
};

export default function VisualFbd({ rungs, setRungs, state, availableTags = [] }) {
  const [activeCat, setActiveCat] = useState("Favorites");
  
  const updateRung = (i, fn) => setRungs(rungs.map((r, j) => (j === i ? fn(r) : r)));

  const addNetwork = () => {
    setRungs([...rungs, {
      out: availableTags[availableTags.length - 1] || "MOTOR",
      fbd: { type: "BLOCK", block: "AND", ins: [{ tag: availableTags[0] || "START", inv: false }, { tag: availableTags[1] || "STOP", inv: false }] }
    }]);
  };

  const addBlockFromPalette = (instr) => {
    const newIns = Array.from({ length: instr.ins }).map((_, idx) => ({ tag: availableTags[idx % availableTags.length] || "START", inv: false }));
    setRungs([...rungs, {
      out: availableTags[availableTags.length - 1] || "MOTOR",
      fbd: { type: "BLOCK", block: instr.t, ins: newIns }
    }]);
  };

  const addInputPin = (i) => {
    updateRung(i, (r) => ({
      ...r,
      fbd: { ...r.fbd, ins: [...r.fbd.ins, { tag: availableTags[0] || "START", inv: false }] }
    }));
  };

  const toggleInversion = (i, k) => {
    updateRung(i, (r) => ({
      ...r,
      fbd: { ...r.fbd, ins: r.fbd.ins.map((p, j) => j === k ? { ...p, inv: !p.inv } : p) }
    }));
  };

  const changeTag = (i, k, newTag) => {
    updateRung(i, (r) => ({
      ...r,
      fbd: { ...r.fbd, ins: r.fbd.ins.map((p, j) => j === k ? { ...p, tag: newTag } : p) }
    }));
  };

  return (
    <div className="flex h-full text-black bg-[#f0f0f0]">
      
      {/* CANVAS AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {rungs.length === 0 && (
          <div className="text-gray-500 text-sm flex justify-center items-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            Click "Add Network" or choose an instruction from the right.
          </div>
        )}

        {rungs.map((r, i) => !r.fbd ? null : (
          <div key={i} className="bg-white border border-gray-300 shadow-sm flex flex-col mb-4"> 
            <div className="bg-[#e6e6e6] border-b border-gray-300 px-3 py-1.5 flex justify-between text-xs text-gray-700 font-medium">
              <span>Network {i + 1} : {r.fbd.block} Logic</span>
              <button onClick={() => setRungs(rungs.filter((_, j) => j !== i))} className="text-red-600 hover:underline">Delete</button>
            </div>
            
            <div className="p-8 flex items-center font-sans text-xs relative min-h-[160px]">
              
              {/* Left Power Rail */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-black"></div>

              {/* INPUTS (Left Side) */}
              <div className="flex flex-col gap-4 relative z-10 ml-4">
                {r.fbd.ins.map((p, k) => (
                  <div key={k} className="flex items-center group relative">
                    {/* Floating Tag Dropdown */}
                    <div className="flex flex-col text-right pr-2 w-24 absolute -left-[100px]">
                      <select
                        value={p.tag}
                        onChange={(e) => changeTag(i, k, e.target.value)}
                        className="text-black font-bold bg-transparent text-right outline-none cursor-pointer text-[11px]"
                      >
                        {availableTags.map(t => <option key={t} value={t}>{ALIAS[t] || t}</option>)}
                      </select>
                      <span className="text-gray-500 text-[9px]">{p.tag.includes("PB") ? "DI" + (parseInt(p.tag.replace("PB",""))-1) : p.tag}</span>
                    </div>
                    
                    {/* Inversion Bubble (NOT) - Click to toggle */}
                    <button 
                      onClick={() => toggleInversion(i, k)}
                      className={`w-3 h-3 rounded-full border border-black absolute -left-2 z-20 ${p.inv ? "bg-black" : "bg-white opacity-0 group-hover:opacity-100"}`}
                      title="Toggle Inversion (NOT)"
                    ></button>

                    {/* Wire in */}
                    <div className={`h-[2px] w-[80px] transition-colors ${state[p.tag] !== p.inv ? "bg-green-500" : "bg-blue-600"}`}></div>
                  </div>
                ))}
                
                {/* Add Input Pin Button */}
                <button onClick={() => addInputPin(i)} className="text-blue-600 text-left absolute -left-[100px] -bottom-8 hover:underline w-24 text-right">
                  + Add Pin
                </button>
              </div>

              {/* THE FUNCTION BLOCK (Center) */}
              <div className="flex flex-col relative z-10 mx-2">
                <div className="border border-black bg-white min-w-[70px] h-[70px] flex flex-col items-center justify-center relative">
                  <span className="absolute -top-4 text-[10px] text-gray-500">Bool</span>
                  <span className="text-2xl font-bold text-black">
                    {r.fbd.block === "AND" ? "&" : 
                     r.fbd.block === "OR" ? "≥1" : 
                     r.fbd.block === "XOR" ? "=1" : 
                     r.fbd.block === "NOT" ? "1" : 
                     r.fbd.block}
                  </span>
                  <span className="absolute -bottom-4 text-[10px] text-gray-500">Bool</span>
                  
                  {/* SR Specific pins */}
                  {r.fbd.block === "SR" && (
                    <>
                      <div className="absolute top-2 left-1 text-[10px] font-bold">S</div>
                      <div className="absolute bottom-2 left-1 text-[10px] font-bold">R</div>
                      <div className="absolute top-2 right-1 text-[10px] font-bold">Q</div>
                    </>
                  )}
                </div>
              </div>

              {/* OUTPUT (Right Side) */}
              <div className="flex items-center relative z-10">
                {/* Wire out */}
                <div className={`h-[2px] w-[80px] transition-colors ${state[r.out] ? "bg-green-500" : "bg-blue-600"}`}></div>
                
                {/* Floating Output Dropdown */}
                <div className="flex flex-col text-left pl-2 absolute -right-[100px] w-24">
                  <select
                    value={r.out}
                    onChange={(e) => updateRung(i, (x) => ({ ...x, out: e.target.value }))}
                    className="text-black font-bold bg-transparent outline-none cursor-pointer text-[11px]"
                  >
                    {availableTags.map(t => <option key={t} value={t}>{ALIAS[t] || t}</option>)}
                  </select>
                  <span className="text-gray-500 text-[9px]">{r.out.includes("LAMP") ? "DO0" : r.out}</span>
                </div>
              </div>

              {/* Right Power Rail */}
              <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-black"></div>
            </div>
          </div>
        ))}

        <button onClick={addNetwork} className="bg-blue-600 text-white font-medium px-4 py-2 rounded shadow hover:bg-blue-700 w-max">
          + Add Network
        </button>
      </div>

      {/* RIGHT INSTRUCTION PALETTE */}
      <div className="w-64 bg-[#f3f3f3] border-l border-gray-400 flex flex-col text-xs text-black shadow-lg">
        <div className="flex gap-1 bg-gray-200 border-b border-gray-400 p-1">
           {Object.keys(PALETTE).map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} className={`px-3 py-1.5 font-semibold ${activeCat === cat ? "bg-white border border-gray-400 shadow-sm" : "hover:bg-gray-300 text-gray-600"}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
          {PALETTE[activeCat].map(instr => (
            <button
              key={instr.t}
              onClick={() => addBlockFromPalette(instr)}
              className="w-full text-left px-2 py-2 border border-transparent hover:border-blue-400 hover:bg-blue-50 flex items-center gap-3 transition"
            >
              <div className="w-8 h-8 flex items-center justify-center font-mono bg-white text-[10px] font-bold border border-gray-300">
                {instr.t === "AND" ? "&" : instr.t === "OR" ? "≥1" : instr.t === "XOR" ? "=1" : instr.t}
              </div>
              <span className="font-medium text-gray-700">{instr.l}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
