// Runs the reference solution from lib/hints.js (the "Solution" hint) against every problem's tests,
// and against the hidden exam tests where a problem is used in a checkpoint.
// Usage: npm run check:problems   (exit code 1 if any problem fails)
import { loadLib } from "./load-lib.mjs";

const lib = await loadLib(["sim", "problems_projects", "problems_more", "problems_overlay", "problems", "hints", "exam_tests"]);
const { runTests } = lib.sim, { PROBLEMS } = lib.problems, { HINTS } = lib.hints, { EXAM_TESTS } = lib.exam_tests;

// "A AND NOT B" -> "A && !B", N(X) / P(X) -> the engine's edge tags
const expr = (s) => s.replace(/\bN\((\w+)\)/g, "_f_$1").replace(/\bP\((\w+)\)/g, "_r_$1")
  .replace(/\bAND\b/g, "&&").replace(/\bOR\b/g, "||").replace(/\bNOT\s*/g, "!");

// pr5 is written with templates in the hint text; expand them
function expand(id, sol) {
  if (id !== "pr5") return sol;
  const cond = "(F1 AND REQ1) OR (F2 AND REQ2) OR (F3 AND REQ3)";
  return sol.replace("REQn = (CALLn OR REQn) AND NOT (Fn AND T1_Q)", [1, 2, 3].map((n) => `REQ${n} = (CALL${n} OR REQ${n}) AND NOT (F${n} AND T1_Q)`).join("; "))
    .replace("same condition", `(${cond})`);
}

function parse(sol) {
  return sol.split(/;\s+/).map((st) => {
    let m;
    if ((m = st.match(/^(TON|TOF|TP) (\w+) \(PT = (\d+)\): input = (.+)$/))) return { kind: m[1], inst: m[2], pt: +m[3], c: "", expr: expr(m[4]) };
    if ((m = st.match(/^(CTU|CTD) (\w+) \(PV = (\d+)\): input = (.+)$/))) return { kind: m[1], inst: m[2], pv: +m[3], c: "", expr: expr(m[4]) };
    if ((m = st.match(/^Reset counter (\w+): input = (.+)$/))) return { kind: "CRES", inst: m[1], c: "", expr: expr(m[2]) };
    if ((m = st.match(/^(ADD|SUB|MUL|DIV) \((Int|Real)\): (\w+) = (\w+) [+\-*/] (\w+) when (.+)$/))) return { kind: "MATH", op: m[1], dt: m[2], dest: m[3], a: m[4], b: m[5], c: "", expr: expr(m[6]) };
    if ((m = st.match(/^(\w+) = (.+)$/))) return { out: m[1], c: "", expr: expr(m[2]) };
    return null;
  });
}

let failed = 0;
for (const p of PROBLEMS) {
  const raw = HINTS[p.id]?.[2];
  if (!raw) { failed++; console.log(`FAIL ${p.id}  no reference solution in lib/hints.js`); continue; }
  const rungs = parse(expand(p.id, raw));
  if (rungs.some((r) => !r)) { failed++; console.log(`FAIL ${p.id}  could not parse the reference solution`); continue; }
  const run = (tests, preset) => runTests(rungs, preset, tests, p.tags).filter((r) => !r.ok);
  const bad = run(p.tests, p.preset), badExam = EXAM_TESTS[p.id] ? run(EXAM_TESTS[p.id], "none") : [];
  if (bad.length || badExam.length) {
    failed++;
    console.log(`FAIL ${p.id}  ${p.title}`);
    for (const b of bad) console.log(`       practice: ${b.label} -> ${b.got}`);
    for (const b of badExam) console.log(`       exam:     ${b.label} -> ${b.got}`);
  } else console.log(`ok   ${p.id}  ${p.title}${EXAM_TESTS[p.id] ? "  (+ exam tests)" : ""}`);
}
console.log(`\n${PROBLEMS.length - failed}/${PROBLEMS.length} reference solutions pass`);
process.exit(failed ? 1 : 0);
