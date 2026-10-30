"use client";
import { useState } from "react";
import { ALIAS } from "@/lib/sim";

export default function VisualLadder({ networks, setNetworks, state, availableTags = [] }) {
  const updateNetwork = (i, fn) => setNetworks(networks.map((r, j) => (j === i ? fn(r) : r)));

  const addNetwork = () => {
    setNetworks([...networks, {
      out: availableTags[availableTags.length - 1] || "MOTOR",
      branches: [[{ type: "NO", tag: availableTags[0] || "START" }]]
    }]);
  };

  const addBranch = (netIndex) => {
    updateNetwork(netIndex, (net) => ({
      ...net,
      branches: [...net.branches, [{ type: "NO", tag: availableTags[0] || "START" }]]
    }));
  };

  const addContact = (netIndex, branchIndex) => {
    updateNetwork(netIndex, (net) => {
      const newBranches = net.branches.map((b, j) => 
        j === branchIndex ? [...b, { type: "NO", tag: availableTags[0] || "START" }] : b
      );
      return { ...net, branches: newBranches };
    });
  };

  const updateElement = (netIndex, branchIndex, elemIndex, changes) => {
    updateNetwork(netIndex, (net) => {
      const newBranches = net.branches.map((b, j) => 
        j === branchIndex ? b.map((e, k) => k === elemIndex ? { ...e, ...changes } : e) : b
      );
      return { ...net, branches: newBranches };
    });
  };

  const removeElement = (netIndex, branchIndex, elemIndex) => {
    updateNetwork(netIndex, (net) => {
      const newBranches = net.branches.map((b, j) => 
        j === branchIndex ? b.filter((_, k) => k !== elemIndex) : b
      ).filter(b => b.length > 0);
      return { ...net, branches: newBranches };
    });
  };

  return (
    <div className="flex h-full text-black bg-[#f0f0f0] font-sans">
      
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {networks.length === 0 && (
          <div className="text-gray-500 text-sm flex justify-center items-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            No networks. Click "Add Network" to begin.
          </div>
        )}

        {networks.map((net, i) => (
          <div key={i} className="bg-white border border-gray-300 shadow-sm flex flex-col mb-4" style={{ minWidth: '800px' }}> 
            <div className="bg-[#f3f3f3] border-b border-gray-300 px-3 py-1.5 flex justify-between text-xs text-gray-700 font-medium">
              <span>Network {i + 1} : Title</span>
              <button onClick={() => setNetworks(networks.filter((_, j) => j !== i))} className="text-red-600 hover:underline">Delete</button>
            </div>
            
            <div className="relative p-8">
              <svg width="100%" height={Math.max(100, net.branches.length * 60 + 40)} className="overflow-visible">
                
                {/* Left Power Rail */}
                <line x1="20" y1="0" x2="20" y2="100%" stroke="black" strokeWidth="2" />

                {/* Draw Branches */}
                {net.branches.map((branch, bIdx) => {
                  const y = 40 + bIdx * 60;
                  const startX = 40; 
                  const contactWidth = 60;

                  return (
                    <g key={bIdx}>
                      {/* Vertical Branch Connector (if not first branch) */}
                      {bIdx > 0 && (
                        <line x1="20" y1={y - 60} x2="20" y2={y} stroke="black" strokeWidth="2" />
                      )}

                      {/* Branch Wire Start */}
                      <line x1="20" y1={y} x2={startX} y2={y} stroke={state[net.out] ? "#10b981" : "black"} strokeWidth="2" />

                      {/* Contacts in Series */}
                      {branch.map((el, eIdx) => {
                        const isOn = el.type === "NC" ? !state[el.tag] : !!state[el.tag];
                        const cx = startX + eIdx * contactWidth;
                        const wireColor = isOn ? "#10b981" : "#2563eb";

                        return (
                          <g key={eIdx} className="group">
                            {/* Contact Symbol */}
                            <g transform={`translate(${cx}, ${y})`}>
                              {/* Left Wire */}
                              <line x1="0" y1="0" x2="15" y2="0" stroke={wireColor} strokeWidth="2" strokeDasharray={isOn ? "none" : "4,4"} />
                              
                              {/* NO/NC Vertical Bars */}
                              <line x1="15" y1="-10" x2="15" y2="10" stroke="black" strokeWidth="2" />
                              <line x1="25" y1="-10" x2="25" y2="10" stroke="black" strokeWidth="2" />
                              
                              {/* NC Diagonal Line */}
                              {el.type === "NC" && (
                                <line x1="15" y1="10" x2="25" y2="-10" stroke="black" strokeWidth="2" />
                              )}
                              
                              {/* Right Wire */}
                              <line x1="25" y1="0" x2="60" y2="0" stroke={wireColor} strokeWidth="2" strokeDasharray={isOn ? "none" : "4,4"} />

                              {/* Floating Tag Text */}
                              <text x="20" y="-18" textAnchor="middle" fontSize="11" fill="#1d4ed8" fontWeight="bold" className="cursor-pointer">
                                {ALIAS[el.tag] || el.tag}
                              </text>
                              <text x="20" y="22" textAnchor="middle" fontSize="9" fill="#6b7280">
                                {el.tag.includes("PB") ? "DI" + (parseInt(el.tag.replace("PB",""))-1) : el.tag}
                              </text>

                              {/* Interactive Overlay (Dropdown & Delete) */}
                              <foreignObject x="0" y="-30" width="60" height="60" className="opacity-0 hover:opacity-100">
                                <div className="flex flex-col items-center justify-center h-full bg-white/80 border border-blue-300 rounded">
                                  <select
                                    value={el.tag}
                                    onChange={(e) => updateElement(i, bIdx, eIdx, { tag: e.target.value })}
                                    className="text-[10px] w-14 outline-none"
                                  >
                                    {availableTags.map(t => <option key={t} value={t}>{ALIAS[t] || t}</option>)}
                                  </select>
                                  <div className="flex gap-1 mt-1">
                                    <button onClick={() => updateElement(i, bIdx, eIdx, { type: el.type === "NO" ? "NC" : "NO" })} className="text-[8px] bg-gray-200 px-1">TGL</button>
                                    <button onClick={() => removeElement(i, bIdx, eIdx)} className="text-[8px] bg-red-200 px-1">DEL</button>
                                  </div>
                                </div>
                              </foreignObject>
                            </g>
                          </g>
                        );
                      })}

                      {/* Add Contact Button (at the end of the series) */}
                      <g transform={`translate(${startX + branch.length * contactWidth}, ${y})`} className="cursor-pointer group">
                         <line x1="0" y1="0" x2="10" y2="0" stroke={state[net.out] ? "#10b981" : "black"} strokeWidth="2" />
                         <circle cx="20" cy="0" r="10" fill="white" stroke="#9ca3af" strokeWidth="1" />
                         <text x="20" y="4" textAnchor="middle" fontSize="14" fill="#9ca3af" fontWeight="bold">+</text>
                         <foreignObject x="-10" y="-15" width="40" height="30" className="opacity-0 group-hover:opacity-100">
                            <button onClick={() => addContact(i, bIdx)} className="w-full h-full bg-transparent" title="Add Series Contact"></button>
                         </foreignObject>
                      </g>

                      {/* Final Wire to Coil (Only draw once per network, merge branches) */}
                      {bIdx === 0 && (
                        <g>
                          {/* Vertical line merging all branches */}
                          <line x1={startX + branch.length * contactWidth + 40} y1={y} x2={startX + branch.length * contactWidth + 40} y2={y + (net.branches.length - 1) * 60} stroke="black" strokeWidth="2" />
                          
                          {/* Wire to Coil */}
                          <line x1={startX + branch.length * contactWidth + 40} y1={y} x2={startX + branch.length * contactWidth + 80} y2={y} stroke={state[net.out] ? "#10b981" : "#2563eb"} strokeWidth="2" strokeDasharray={state[net.out] ? "none" : "4,4"} />
                          
                          {/* The Coil */}
                          <g transform={`translate(${startX + branch.length * contactWidth + 80}, ${y})`} className="group">
                            <circle cx="15" cy="0" r="12" fill="white" stroke={state[net.out] ? "#10b981" : "black"} strokeWidth="2" />
                            <line x1="27" y1="0" x2="40" y2="0" stroke="black" strokeWidth="2" />
                            
                            {/* Coil Tag */}
                            <text x="15" y="-20" textAnchor="middle" fontSize="11" fill="#1d4ed8" fontWeight="bold">
                              {ALIAS[net.out] || net.out}
                            </text>
                            <text x="15" y="26" textAnchor="middle" fontSize="9" fill="#6b7280">
                              {net.out.includes("LAMP") ? "DO0" : net.out}
                            </text>

                            {/* Output Tag Overlay */}
                            <foreignObject x="-15" y="-30" width="60" height="60" className="opacity-0 hover:opacity-100">
                                <div className="flex flex-col items-center justify-center h-full bg-white/80 border border-blue-300 rounded">
                                  <select
                                    value={net.out}
                                    onChange={(e) => updateNetwork(i, (x) => ({ ...x, out: e.target.value }))}
                                    className="text-[10px] w-14 outline-none"
                                  >
                                    {availableTags.map(t => <option key={t} value={t}>{ALIAS[t] || t}</option>)}
                                  </select>
                                </div>
                            </foreignObject>
                          </g>
                          
                          {/* Right Power Rail */}
                          <line x1={startX + branch.length * contactWidth + 120} y1="0" x2={startX + branch.length * contactWidth + 120} y2="100%" stroke="black" strokeWidth="2" />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Add Branch Button (HTML positioned below the SVG) */}
              <div className="absolute bottom-2 left-12">
                <button onClick={() => addBranch(i)} className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-300 rounded px-2 py-1 shadow-sm hover:bg-white hover:text-blue-600 flex items-center gap-1">
                  <span className="text-lg leading-none">┼</span> Add Parallel Branch
                </button>
              </div>

            </div>
          </div>
        ))}

        <button onClick={addNetwork} className="bg-blue-600 text-white font-medium px-4 py-2 rounded shadow hover:bg-blue-700">
          + Add Network (Rung)
        </button>
      </div>
    </div>
  );
}
