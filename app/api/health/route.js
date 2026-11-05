import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";   // never cached: every call really reads the database

// Point an uptime monitor at /api/health. It also counts as database activity, which stops Supabase's free plan pausing the project.
export async function GET() {
  const t = Date.now();
  try {
    await prisma.user.findFirst({ select: { id: true } });
    return Response.json({ ok: true, dbMs: Date.now() - t });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
