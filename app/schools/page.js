import { SITE, pilotHref, pilotBlurb } from "@/lib/site";
import { Hero, Section, Cards, Faq } from "@/components/OrgBits";
import CourseSection, { PricingSection } from "@/components/Course";

export const metadata = { title: `For trainers and schools | ${SITE.name}`, description: "Browser-based PLC ladder-logic practice for in-person classes, with a trainer view of every trainee's progress." };

const FEATURES = [
  ["Practice beside the hardware", "Every trainee gets their own bench in the browser, so nobody waits for a trainer kit. Use it before, during and after hands-on sessions."],
  ["36 practice problems", "From a single contact and coil up to five complete plants: bottling, paint mixing, pasteurising, pumping and a three-floor lift."],
  ["Live machines", "Simple 2D scenes (garage door, tanks, conveyors, traffic lights) react to the trainee's ladder logic, with instant checking and hints that unlock as they try."],
  ["A trainer view", "Create a class, share the code, and see each trainee's solved problems, recent activity and checkpoint results. Export the class as a CSV."],
  ["A scored checkpoint", "Four tasks with hidden tests, no hints and three tries each. Passing 3 of 4 earns a badge that anyone can verify with a code."],
  ["Nothing to install", "It runs in a current browser on a laptop or tablet. The scenes are lightweight, so older machines work."],
];
const FAQ = [
  ["Does it replace our hardware trainers?", "No. It gives every trainee practice time at once and lets them make mistakes at no cost, so hands-on time with the real equipment goes further."],
  ["Which PLC does it teach?", "The ladder editor is styled after Siemens TIA Portal (it is not affiliated with Siemens). The ladder-logic ideas carry over to other IEC 61131-3 PLCs, but it does not replace the vendor's own software."],
  ["How do trainees sign in?", "They register with their name, email and a password, then join your class with the code you share."],
  ["What does the trainer see?", "For each trainee: problems solved, recent activity and checkpoint results, plus a CSV export of the class."],
  ["What does it not do?", "It does not connect to physical PLCs, and the machines are simplified 2D simulations for learning. It covers PLC ladder logic and function block diagrams only. SCADA, drives, networks and the other course topics are taught in the physical class."],
  ["What equipment does the room need?", "A laptop or tablet with a current browser for each trainee, or one for each pair. A working internet connection is needed for sign-in and saving. Tell us about the room in the pilot request."],
];

export default function Schools() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12">
      <Hero title="PLC practice for every trainee in the class."
        lead="Trainees build ladder logic and watch simulated machines respond, alongside your physical trainers. You see how each of them is doing."
        links={[["Request a pilot", pilotHref()], ["See how it works", "#how"]]} />
      <Section id="how" title="What your class gets">
        <Cards items={FEATURES} />
      </Section>
      <CourseSection />
      <Section id="pilot" title="Start with a pilot" intro={pilotBlurb()}>
        <a href={pilotHref()} className="inline-block rounded-lg bg-cyan-600 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-500">Request a pilot</a>
      </Section>
      <PricingSection />
      <Section title="Questions from trainers"><Faq items={FAQ} /></Section>
    </main>
  );
}
