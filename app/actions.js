"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { PROBLEMS } from "@/lib/problems";
import { runTests } from "@/lib/sim";
import { HINTS } from "@/lib/hints";

export async function register(fd) {
  const p = z.object({
    name: z.string().trim().min(2).max(60),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(100),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) redirect("/register?error=" + encodeURIComponent("Check details (password min 8 chars)"));
  if (process.env.SIGNUP_CODE && fd.get("code") !== process.env.SIGNUP_CODE) redirect("/register?error=" + encodeURIComponent("Invalid invite code"));
  if (await prisma.user.findUnique({ where: { email: p.data.email } })) redirect("/register?error=" + encodeURIComponent("Email already registered"));
  await prisma.user.create({ data: { ...p.data, password: await bcrypt.hash(p.data.password, 10) } });
  redirect("/login");
}

export async function saveProject({ id, title, data, isPublic }) {
  const u = await getUser();
  if (!u) return { error: "Log in to save projects" };
  const json = JSON.stringify(data);
  if (json.length > 20000) return { error: "Project too large" };
  // Solutions are verified on the server, so the "tests passed" badge can't be faked from the browser.
  const problem = PROBLEMS.find((x) => x.id === data?.problem);
  let solved = false;
  if (problem) { try { solved = runTests(data.rungs, problem.preset, problem.tests, problem.tags).every((r) => r.ok); } catch {} }
  const f = { title: String(title || "Untitled").slice(0, 80), ladderJson: json, problemId: problem?.id || null, solved };
  if (isPublic !== undefined) f.isPublic = !!isPublic;   // plain Save keeps current visibility
  let pid = id;
  if (id) { const r = await prisma.project.updateMany({ where: { id, userId: u.id }, data: f }); if (r.count === 0) pid = null; }
  if (!pid) pid = (await prisma.project.create({ data: { ...f, userId: u.id } })).id;
  revalidatePath("/projects"); revalidatePath("/community"); revalidatePath("/problems");
  return { id: pid, solved };
}

export async function getProject(id) {
  const u = await getUser();
  if (!u) return null;
  const p = await prisma.project.findFirst({ where: { id, OR: [{ userId: u.id }, { isPublic: true }] } });
  return p ? { id: p.id, title: p.title, data: JSON.parse(p.ladderJson) } : null;
}

export async function deleteProject(fd) {
  const u = await getUser();
  if (!u) redirect("/login");
  await prisma.project.deleteMany({ where: { id: fd.get("id"), userId: u.id } });
  revalidatePath("/projects");
}

export async function setPublic(fd) {
  const u = await getUser();
  if (!u) redirect("/login");
  const id = fd.get("id");
  const p = await prisma.project.findFirst({ where: { id, userId: u.id } });
  if (p) await prisma.project.update({ where: { id }, data: { isPublic: !p.isPublic } });
  revalidatePath("/projects");
}

export async function newPost(fd) {
  const u = await getUser();
  if (!u) redirect("/login");
  const d = z.object({ title: z.string().trim().min(2).max(120), body: z.string().trim().min(1).max(2000) }).safeParse(Object.fromEntries(fd));
  if (d.success) await prisma.post.create({ data: { ...d.data, userId: u.id } });
  revalidatePath("/community");
}

export async function newComment(fd) {
  const u = await getUser();
  if (!u) redirect("/login");
  const d = z.object({ postId: z.string(), body: z.string().trim().min(1).max(1000) }).safeParse(Object.fromEntries(fd));
  if (d.success && (await prisma.post.findUnique({ where: { id: d.data.postId } }))) await prisma.comment.create({ data: { ...d.data, userId: u.id } });
  revalidatePath("/community");
}

export async function toggleLike(fd) {
  const u = await getUser();
  if (!u) redirect("/login");
  const k = { userId: u.id, projectId: String(fd.get("id")) };
  const ex = await prisma.like.findUnique({ where: { userId_projectId: k } });
  if (ex) await prisma.like.delete({ where: { id: ex.id } });
  else if (await prisma.project.findFirst({ where: { id: k.projectId, isPublic: true } })) await prisma.like.create({ data: k });
  revalidatePath("/community");
}

const NEED = [0, 2, 4];   // failed checks needed before hint 1, hint 2, and the full solution unlock

export async function checkSolution({ problemId, rungs }) {
  const problem = PROBLEMS.find((x) => x.id === problemId);
  if (!problem || !Array.isArray(rungs) || rungs.length > 60 || JSON.stringify(rungs).length > 20000) return { error: "Unknown problem or program too large" };
  let results;
  try { results = runTests(rungs, problem.preset, problem.tests, problem.tags); } catch { return { error: "Could not run the tests" }; }
  const ok = results.every((r) => r.ok);
  const u = await getUser();
  if (!u) return { results, ok, signedIn: false };
  const k = { userId_problemId: { userId: u.id, problemId } };
  const cur = await prisma.progress.findUnique({ where: k });
  const data = { attempts: (cur?.attempts || 0) + (ok || cur?.solved ? 0 : 1), solved: ok || !!cur?.solved };
  if (ok && !cur?.solved) data.solvedAt = new Date();
  await prisma.progress.upsert({ where: k, create: { userId: u.id, problemId, ...data }, update: data });
  revalidatePath("/problems");
  return { results, ok, signedIn: true };
}

export async function getHints({ problemId }) {
  const u = await getUser();
  if (!u) return { error: "Log in to use hints and save your progress." };
  const H = HINTS[problemId];
  if (!H) return { error: "No hints for this problem yet." };
  const cur = (await prisma.progress.findUnique({ where: { userId_problemId: { userId: u.id, problemId } } })) || { attempts: 0, hints: 0, solved: false };
  const need = NEED[cur.hints];
  return { revealed: H.slice(0, cur.hints), hints: cur.hints, attempts: cur.attempts, solved: cur.solved, need, canNext: cur.hints < 3 && (cur.solved || cur.attempts >= need) };
}

export async function revealHint({ problemId }) {
  const s = await getHints({ problemId });
  if (s.error) return s;
  if (!s.canNext) return { error: "Not unlocked yet. Try validating your solution first." };
  const u = await getUser();
  await prisma.progress.upsert({ where: { userId_problemId: { userId: u.id, problemId } }, create: { userId: u.id, problemId, hints: 1 }, update: { hints: s.hints + 1 } });
  return getHints({ problemId });
}

export async function saveReview(fd) {
  const u = await getUser();
  if (!u) redirect("/login");
  const d = z.object({ rating: z.coerce.number().int().min(1).max(5), body: z.string().trim().max(600) }).safeParse(Object.fromEntries(fd));
  if (!d.success) return;
  await prisma.review.upsert({ where: { userId: u.id }, create: { ...d.data, userId: u.id }, update: d.data });   // one review per user
  revalidatePath("/community");
}

export async function deleteReview() {
  const u = await getUser();
  if (!u) redirect("/login");
  await prisma.review.deleteMany({ where: { userId: u.id } });
  revalidatePath("/community");
}
