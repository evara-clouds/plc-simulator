export const SITE = {
  name: "PLC Practice Companion",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  operator: process.env.NEXT_PUBLIC_OPERATOR || "the project owner",
  demo: process.env.NEXT_PUBLIC_DEMO_VIDEO || "",
};
export const pilotHref = () => (SITE.email ? `mailto:${SITE.email}?subject=${encodeURIComponent("Pilot request: " + SITE.name)}` : "/contact");
