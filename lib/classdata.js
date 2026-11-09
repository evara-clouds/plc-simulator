import { prisma } from "@/lib/prisma";
import { PROBLEMS } from "@/lib/problems";
// Progress report for one class (used by the trainer page and the CSV export).
export async function classReport(classId) {
  const members = await prisma.enrollment.findMany({ where: { classId }, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "asc" } });
  const ids = members.map((m) => m.userId);
  const [prog, runs] = await Promise.all([prisma.progress.findMany({ where: { userId: { in: ids } } }), prisma.examRun.findMany({ where: { userId: { in: ids } } })]);
  return members.map((m) => {
    const p = prog.filter((x) => x.userId === m.userId), r = runs.filter((x) => x.userId === m.userId);
    return { name: m.user.name, email: m.user.email, solved: p.filter((x) => x.solved).length, total: PROBLEMS.length, failed: p.reduce((a, x) => a + x.attempts, 0), hints: p.reduce((a, x) => a + x.hints, 0),
      last: p.length ? new Date(Math.max(...p.map((x) => +x.updatedAt))) : null, exam: r.map((x) => `${JSON.parse(x.passed).length} tasks${x.code ? " · badge " + x.code : ""}`).join("; ") };
  });
}
