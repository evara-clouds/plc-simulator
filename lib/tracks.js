// Learning paths: every problem appears in exactly one track, in the recommended order.
export const TRACKS = [
  { id: "start", title: "Start here", blurb: "Contacts, coils and simple conditions. No memory needed yet.",
    problems: ["e1", "b4", "e3", "b3", "b2", "b9", "b10", "e2"] },
  { id: "latch", title: "Latching & interlocks", blurb: "Seal-in circuits, STOP buttons, and outputs that must never run together.",
    problems: ["m1", "b1", "m2", "b5", "b6", "b7", "b8", "b15", "b12"] },
  { id: "traffic", title: "Traffic lights & crossings", blurb: "Lamps, remembered requests and safe switch-over between roads.",
    problems: ["t2", "b13", "t1", "b14"] },
  { id: "process", title: "Process control", blurb: "Level control, sequencing and protection logic for tanks and lines.",
    problems: ["m3", "b11", "b16", "h1", "h3", "h2"] },
  { id: "timers", title: "Timers, counters & math", blurb: "TON, TOF, CTU and ADD. Instance names like T1 and C1 work like TIA's DB names.", problems: ["tc1", "tc2", "tc3", "tc4"] },
];
