// Regression tests for lib/sim.js. Usage: npm run test:engine
import assert from "node:assert/strict";
import { loadLib } from "./load-lib.mjs";

const { sim } = await loadLib(["sim"]);
const { scan, ev } = sim;
const cases = [];
const test = (name, fn) => cases.push([name, fn]);
const coil = (out, tag, k = "NO") => ({ out, c: "", series: [{ k, tag }] });
const steps = (rungs, start, seq, key) => { let t = start; return seq.map((s) => (t = scan({ ...t, ...s }, rungs, "none"), t[key])); };

test("rising edge of an input fires for exactly one scan", () => {
  assert.deepEqual(steps([coil("R", "A", "P")], { A: false }, [{ A: false }, { A: true }, { A: true }, { A: false }], "R"), [false, true, false, false]);
});
test("falling edge of an input fires for exactly one scan", () => {
  assert.deepEqual(steps([coil("R", "A", "N")], { A: true }, [{ A: true }, { A: false }, { A: false }], "R"), [false, true, false]);
});
test("edge contacts also see changes the program makes itself (coil-driven tags)", () => {
  const rungs = [coil("F", "A"), coil("RISE", "F", "P"), coil("FALL", "F", "N")];
  let t = { A: false, F: false };
  const rise = [], fall = [];
  for (const a of [true, true, false, false]) { t = scan({ ...t, A: a }, rungs, "none"); rise.push(t.RISE); fall.push(t.FALL); }
  assert.equal(rise.filter(Boolean).length, 1, "rising edge of F should fire once: " + rise);
  assert.equal(fall.filter(Boolean).length, 1, "falling edge of F should fire once: " + fall);
});

test("negative number literals work in compares", () => {
  assert.equal(ev("TEMP > -5", { TEMP: 0 }), true);
  assert.equal(ev("TEMP > -5", { TEMP: -10 }), false);
  assert.equal(ev("TEMP == -3", { TEMP: -3 }), true);
  assert.equal(ev("-2 < TEMP", { TEMP: -1 }), true);
});
test("a dangling minus is a syntax error (false), not a crash", () => {
  assert.equal(ev("TEMP > -", { TEMP: 1 }), false);
  assert.equal(ev("TEMP > - A", { TEMP: 1, A: 1 }), false);
});

test("CTU stops at 32767", () => {
  const r = [{ kind: "CTU", inst: "C1", pv: 5, c: "", expr: "P" }];
  let t = { P: false, C1_Q: false, C1_CV: 32766 };
  for (let i = 0; i < 6; i++) t = scan({ ...t, P: i % 2 === 0 }, r, "none");
  assert.equal(t.C1_CV, 32767);
});
test("CTD stops at -32768", () => {
  const r = [{ kind: "CTD", inst: "C1", pv: 3, c: "", expr: "P" }];
  let t = { P: false, C1_Q: false, C1_CV: -32767 };
  for (let i = 0; i < 6; i++) t = scan({ ...t, P: i % 2 === 0 }, r, "none");
  assert.equal(t.C1_CV, -32768);
});
test("CTU counts rising edges and Q goes true at the preset", () => {
  const r = [{ kind: "CTU", inst: "C1", pv: 3, c: "", expr: "P" }];
  let t = { P: false };
  for (let i = 0; i < 6; i++) t = scan({ ...t, P: i % 2 === 0 }, r, "none");
  assert.equal(t.C1_CV, 3); assert.equal(t.C1_Q, true);
});

test("TON turns on after exactly PT (2000 ms = 20 scans)", () => {
  const r = [{ kind: "TON", inst: "T1", pt: 2000, c: "", expr: "IN" }];
  let t = { IN: true };
  for (let i = 0; i < 19; i++) t = scan(t, r, "none");
  assert.equal(t.T1_Q, false);
  t = scan(t, r, "none"); assert.equal(t.T1_Q, true);
});
test("seal-in latch holds and STOP breaks it", () => {
  const r = [{ out: "M", c: "", expr: "(START || M) && STOP" }];
  assert.deepEqual(steps(r, { START: false, STOP: true }, [{ START: true }, { START: false }, { STOP: false }, { STOP: true }], "M"), [true, true, false, false]);
});
test("unknown tags and bad syntax evaluate to false instead of throwing", () => {
  assert.equal(ev("NOPE > 3", {}), false);
  assert.equal(ev("A &", { A: true }), false);
  assert.equal(ev("constructor == 1", {}), false);
});

let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log("ok   " + name); } catch (e) { failed++; console.log("FAIL " + name + "\n       " + String(e.message).split("\n")[0]); }
}
console.log(`\n${cases.length - failed}/${cases.length} engine tests pass`);
process.exit(failed ? 1 : 0);
