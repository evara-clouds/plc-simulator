// Own tags (and no unrelated tank / conveyor tags) for the original nine problems. NC inputs start at 1 (healthy).
const mk = (inputs, outputs, tags = {}, nc = []) => ({ preset: "none", inputs, outputs,
  tags: { ...Object.fromEntries([...inputs.map((k) => [k, nc.includes(k)]), ...outputs.map((k) => [k, false])]), ...tags } });
export const OVERLAY = {
  e1: mk(["START"], ["MOTOR"]),
  e2: mk(["START", "ESTOP"], ["MOTOR"], {}, ["ESTOP"]),
  e3: mk(["TANK_LEVEL"], ["VALVE"], { TANK_LEVEL: 15 }),
  m1: mk(["START", "STOP", "ESTOP"], ["MOTOR"], {}, ["STOP", "ESTOP"]),
  m2: mk(["START", "STOP", "ESTOP"], ["CONVEYOR_RUN"], {}, ["STOP", "ESTOP"]),
  m3: mk(["TANK_LEVEL"], ["VALVE"], { TANK_LEVEL: 15 }),
  h1: mk(["MODE", "MANUAL_VALVE", "ESTOP", "TANK_LEVEL"], ["VALVE"], { MODE: "AUTO", TANK_LEVEL: 15 }, ["ESTOP"]),
  h2: mk(["START", "STOP", "ESTOP", "COUNTER_VAL"], ["CONVEYOR_RUN"], { COUNTER_VAL: 0 }, ["STOP", "ESTOP"]),
  h3: mk(["START", "STOP", "ESTOP", "TANK_LEVEL"], ["MOTOR"], { TANK_LEVEL: 15 }, ["STOP", "ESTOP"]),
};
