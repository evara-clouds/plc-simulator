export const SITE = {
  name: "PLC Practice Companion",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  operator: process.env.NEXT_PUBLIC_OPERATOR || "the project owner",
  demo: process.env.NEXT_PUBLIC_DEMO_VIDEO || "",
  // Where in-person pilot classes run. Change it with NEXT_PUBLIC_PILOT_VENUE.
  venue: process.env.NEXT_PUBLIC_PILOT_VENUE || "Centurion Systems Limited",
  // Optional, shown as-is, for example "KES 15,000 per trainee". Leave empty until you have agreed a price.
  price: process.env.NEXT_PUBLIC_PILOT_PRICE || "",
  payMethods: process.env.NEXT_PUBLIC_PAY_METHODS || "M-Pesa, bank transfer or against an invoice",
};
// Every "Request a pilot" button goes to the form on the contact page (never loops back to a page without one).
export const pilotHref = () => "/contact#pilot";
export const pilotBlurb = () =>
  `A pilot runs alongside an in-person class at ${SITE.venue}: trainees work on laptops in the training room next to the hardware trainers, the trainer sees everyone's progress, and we measure practice time, completion and feedback.`;
export const pricingBlurb = () =>
  `${SITE.price ? `Pilot fee: ${SITE.price}. ` : ""}Fees are quoted in Kenya shillings (KES) and agreed with you before the class starts. You can pay by ${SITE.payMethods}.`;
