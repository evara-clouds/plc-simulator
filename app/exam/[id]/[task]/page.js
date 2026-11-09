import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { PROBLEMS } from "@/lib/problems";
import { EXAMS } from "@/lib/exams";
import ExamTask from "@/components/ExamTask";
export const dynamic = "force-dynamic";

export default async function Task({ params }) {
  const u = await getUser(); if (!u) redirect("/login");
  const ex = EXAMS[params.id], p = PROBLEMS.find((x) => x.id === params.task);
  if (!ex || !p || !ex.tasks.includes(p.id)) notFound();
  const run = await prisma.examRun.findUnique({ where: { userId_examId: { userId: u.id, examId: params.id } } });
  const passed = run ? JSON.parse(run.passed) : [], tries = run ? JSON.parse(run.tries) : {};
  const left = ex.maxTries - (tries[p.id] || 0);
  if (passed.includes(p.id) || left <= 0) return <p className="text-slate-300">{passed.includes(p.id) ? "You already passed this task." : "No tries left for this task."} <Link href="/exam" className="text-cyan-400">Back to the checkpoint</Link></p>;
  const { id, title, text, preset, inputs, outputs, tags } = p;   // tests and hints are not sent to the browser
  return <ExamTask prob={{ id, title, text, preset, inputs, outputs, tags }} examId={params.id} triesLeft={left} />;
}
