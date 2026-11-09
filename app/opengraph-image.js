import { ImageResponse } from "next/og";
export const alt = "PLC Practice Companion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse((
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0f1f33", color: "#f3efe6" }}>
      <div style={{ fontSize: 30, color: "#e8a33d" }}>PLC TRAINING</div>
      <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05, marginTop: 20 }}>Practise PLC programming before the lab.</div>
      <div style={{ fontSize: 34, color: "#9fb3c8", marginTop: 30 }}>Live machines. Instant feedback. A badge you can verify.</div>
    </div>
  ), size);
}
