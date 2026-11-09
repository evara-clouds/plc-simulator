import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { isTrainer } from "@/lib/trainer";
import { classReport } from "@/lib/classdata";
export const dynamic = "force-dynamic";
const q = (v) => { const s = String(v ?? ""); return /^[=+\-@]/.test(s) ? `"'${s.replace(/"/g, '""')}"` : `"${s.replace(/"/g, '""')}"`; };   // quoted, and safe to open in a spreadsheet

export async function GET(_req, { params }) {
  const u = await getUser();
  if (!u || !isTrainer(u)) return new Response("Forbidden", { status: 403 });
  const c = await prisma.class.findUnique({ where: { id: params.id } });
  if (!c || c.ownerId !== u.id) return new Response("Not found", { status: 404 });
  const rows = await classReport(c.id);
  const csv = ["Name,Email,Solved,Total,Failed checks,Hints,Last active,Checkpoint", ...rows.map((r) => [r.name, r.email, r.solved, r.total, r.failed, r.hints, r.last ? r.last.toISOString().slice(0, 10) : "", r.exam].map(q).join(","))].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="class-${c.code}.csv"` } });
}
