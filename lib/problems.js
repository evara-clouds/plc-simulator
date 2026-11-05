// Each test: [label, inputs to set, expected outputs]. STOP and ESTOP are normally-closed: true = healthy, false = pressed.
const CORE = [
  { id: "e1", level: "Easy", title: "Jog motor", preset: "tank", out: "MOTOR",
    text: "MOTOR must run only while START is held down.",
    tests: [["hold START", { START: true }, { MOTOR: true }], ["release START", { START: false }, { MOTOR: false }]] },
  { id: "e2", level: "Easy", title: "Safe jog", preset: "tank", out: "MOTOR",
    text: "MOTOR runs while START is held AND the E-STOP is healthy (ESTOP = true).",
    tests: [["START, healthy", { START: true }, { MOTOR: true }], ["E-STOP pressed", { ESTOP: false }, { MOTOR: false }], ["E-STOP released, no START", { ESTOP: true, START: false }, { MOTOR: false }]] },
  { id: "e3", level: "Easy", title: "Low-level valve", preset: "tank", out: "VALVE",
    text: "Open VALVE when TANK_LEVEL is below 30, otherwise keep it closed. (Use a compare block.)",
    tests: [["level 20", { TANK_LEVEL: 20 }, { VALVE: true }], ["level 60", { TANK_LEVEL: 60 }, { VALVE: false }]] },
  { id: "m1", level: "Medium", title: "Seal-in latch", preset: "tank", out: "MOTOR",
    text: "A START pulse latches MOTOR on (seal-in contact in a parallel branch). Pressing STOP (STOP = false) drops it and it must not restart on its own.",
    tests: [["pulse START", { START: true }, { MOTOR: true }], ["release START", { START: false }, { MOTOR: true }], ["press STOP", { STOP: false }, { MOTOR: false }], ["release STOP", { STOP: true }, { MOTOR: false }]] },
  { id: "m2", level: "Medium", title: "Conveyor with E-STOP", preset: "conveyor", out: "CONVEYOR_RUN",
    text: "Latch CONVEYOR_RUN with START. STOP or E-STOP must drop it, and releasing the E-STOP must NOT restart it.",
    tests: [["START", { START: true }, { CONVEYOR_RUN: true }], ["release START", { START: false }, { CONVEYOR_RUN: true }], ["E-STOP", { ESTOP: false }, { CONVEYOR_RUN: false }], ["release E-STOP", { ESTOP: true }, { CONVEYOR_RUN: false }]] },
  { id: "m3", level: "Medium", title: "Hysteresis fill", preset: "tank", out: "VALVE",
    text: "VALVE opens when TANK_LEVEL < 20 and stays open until the level reaches 80, then closes and stays closed until the level drops below 20 again.",
    tests: [["level 10", { TANK_LEVEL: 10 }, { VALVE: true }], ["level 50, still filling", { TANK_LEVEL: 50 }, { VALVE: true }], ["level 90", { TANK_LEVEL: 90 }, { VALVE: false }], ["level 50, stays closed", { TANK_LEVEL: 50 }, { VALVE: false }]] },
  { id: "h1", level: "Hard", title: "Mode-select fill", preset: "tank", out: "VALVE",
    text: "AUTO: VALVE opens below 30 and holds open until 80. MANUAL: VALVE follows MANUAL_VALVE. E-STOP (ESTOP = false) forces it closed in both modes.",
    tests: [["AUTO low", { MODE: "AUTO", TANK_LEVEL: 10 }, { VALVE: true }], ["AUTO mid holds", { TANK_LEVEL: 50 }, { VALVE: true }], ["AUTO high", { TANK_LEVEL: 90 }, { VALVE: false }], ["MANUAL on", { MODE: "MANUAL", MANUAL_VALVE: true, TANK_LEVEL: 50 }, { VALVE: true }], ["MANUAL off", { MANUAL_VALVE: false }, { VALVE: false }], ["E-STOP overrides", { MANUAL_VALVE: true, ESTOP: false }, { VALVE: false }]] },
  { id: "h2", level: "Hard", title: "Count-limited conveyor", preset: "conveyor", out: "CONVEYOR_RUN",
    text: "Latch the conveyor with START/STOP/E-STOP, but it must stop when COUNTER_VAL reaches 3 and refuse to start while COUNTER_VAL >= 3.",
    tests: [["START", { START: true }, { CONVEYOR_RUN: true }], ["release", { START: false }, { CONVEYOR_RUN: true }], ["count = 3", { COUNTER_VAL: 3 }, { CONVEYOR_RUN: false }], ["START blocked", { START: true }, { CONVEYOR_RUN: false }]] },
  { id: "h3", level: "Hard", title: "Dry-run protection", preset: "tank", out: "MOTOR",
    text: "Agitator MOTOR may START only if TANK_LEVEL > 20. Once running it latches (START/STOP/E-STOP as usual) but must trip off if the level falls below 10, and not restart by itself.",
    tests: [["level 50, START", { TANK_LEVEL: 50, START: true }, { MOTOR: true }], ["release START", { START: false }, { MOTOR: true }], ["level 5 trips", { TANK_LEVEL: 5 }, { MOTOR: false }], ["level 50, no restart", { TANK_LEVEL: 50 }, { MOTOR: false }]] },
];

import { MORE } from "./problems_more";
import { OVERLAY } from "./problems_overlay";
export const PROBLEMS = [...CORE, ...MORE].map((p) => (OVERLAY[p.id] ? { ...p, ...OVERLAY[p.id] } : p));
