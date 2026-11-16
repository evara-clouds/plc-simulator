import { NextResponse } from "next/server";

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: pretend success
  const email = String(b.email || "").trim();
  if (!String(b.name || "").trim() || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "name and a valid email are required" }, { status: 400 });

  const clean = Object.fromEntries(Object.entries(b).filter(([k]) => k !== "website").map(([k, v]) => [k, String(v).slice(0, 2000)]));
  console.log("QUOTE REQUEST", JSON.stringify(clean));

  // Optional: forward to a Slack/Discord-style webhook. Set QUOTE_WEBHOOK_URL in .env.local
  if (process.env.QUOTE_WEBHOOK_URL) {
    try {
      await fetch(process.env.QUOTE_WEBHOOK_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "New quote request:\n" + Object.entries(clean).map(([k, v]) => `${k}: ${v}`).join("\n") }),
      });
    } catch (e) { console.error("quote webhook failed", e); }
  }
  return NextResponse.json({ ok: true });
}
