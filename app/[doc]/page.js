import { notFound } from "next/navigation";
import { SITE, pilotHref } from "@/lib/site";
export const dynamicParams = false;
export const generateStaticParams = () => ["privacy", "data-and-security", "terms", "contact"].map((doc) => ({ doc }));
const UPDATED = "November 2026";
const DOCS = {
  privacy: { title: "Privacy", body: [
    ["Who we are", `${SITE.name} is operated by ${SITE.operator}. This page explains what personal data we handle and why.`],
    ["What we collect", "Your name, your email address and a hashed password when you register. We then store what you create and do on the site: saved projects, progress (problems solved, failed checks, hints used), posts, comments, likes and reviews, class membership, and exam results."],
    ["Why", "To let you sign in, save your work and progress, run classes and checkpoints, and issue badges you can verify. We do not sell your data and we do not show advertising."],
    ["Who can see it", "Trainers of a class you join can see your name, email and progress in that class. A badge page shows your name only if you choose to show it. Posts, reviews and shared projects are visible to other users."],
    ["Your rights", "You can ask to see, correct or delete your data at any time using the Contact page. We aim to handle personal data in line with Kenya’s Data Protection Act, 2019."],
    ["Keeping data", "We keep your data until you ask us to delete it or the pilot you belong to ends."],
    ["Updated", UPDATED]] },
  "data-and-security": { title: "Data and security", body: [
    ["What is stored", "Name, email, hashed password, saved projects, progress, posts, comments, reviews, class membership and exam results. We do not collect ID numbers, payment details or phone numbers."],
    ["Where it lives", "Data is stored in a PostgreSQL database hosted in Frankfurt, Germany, and the application runs on Vercel. If an organisation needs its data kept in Kenya, we can deploy a Kenya-hosted copy for that organisation on request."],
    ["How it is protected", "Passwords are stored only as bcrypt hashes. All traffic uses HTTPS. Sessions use signed cookies. Answers are checked on the server, and the hidden exam tests are never sent to your browser. Trainer tools are limited to approved trainers and to the classes they own."],
    ["Your control", "You can delete your own review and projects, and ask us to delete your account and data via the Contact page."],
    ["Problems", "If you think your account or data is at risk, tell us right away using the Contact page."],
    ["Updated", UPDATED]] },
  terms: { title: "Terms of use", body: [
    ["Using the service", "Use the service for learning and training. Keep your password private and do not try to break, overload or cheat the service, including the checkpoints."],
    ["Your content", "You own what you create. By posting or sharing, you let us show it to other users of the service. Do not post anything unlawful, abusive or private about others. We may remove content that breaks these rules."],
    ["Learning tool only", "The scenes are simplified simulations for learning. Do not use the logic you practise here for real machinery without proper design, testing and safety review."],
    ["No guarantees", "The service is provided as it is, during a pilot, without any promise that it is always available or error-free."],
    ["Changes", "We may update these terms and the service. Continuing to use it means you accept the changes."],
    ["Updated", UPDATED]] },
  contact: { title: "Contact", body: [
    ["Get in touch", SITE.email ? `Email ${SITE.email} for questions, data requests, or to report a problem.` : "The contact email has not been published yet. Please ask the person who shared this site with you."],
    ["Request a pilot", "Tell us your organisation, the number of trainees and the course you teach, and we will agree a short pilot."]] },
};
export function generateMetadata({ params }) { return { title: `${DOCS[params.doc]?.title || "Page"} · ${SITE.name}` }; }
export default function Doc({ params }) {
  const d = DOCS[params.doc]; if (!d) notFound();
  return (
    <article className="mx-auto max-w-2xl space-y-5 py-6">
      <h1 className="text-3xl font-bold text-cyan-400">{d.title}</h1>
      {d.body.map(([h, p]) => <section key={h}><h2 className="mb-1 text-lg font-semibold">{h}</h2><p className="text-slate-300">{p}</p></section>)}
      {params.doc === "contact" && <a href={pilotHref()} className="btn inline-block">Request a pilot</a>}
    </article>
  );
}
