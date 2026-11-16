import { SITE, pilotHref, pilotBlurb, pricingBlurb } from "@/lib/site";
import { Hero, Section, Cards, Faq } from "@/components/OrgBits";
import CourseSection from "@/components/Course";

export const metadata = { title: `For employers | ${SITE.name}`, description: "Give technicians and electricians PLC ladder-logic practice without tying up equipment, and see what each person has proved." };

const USES = [
  ["New technicians", "Practice PLC basics on a laptop before they touch your equipment, with their progress visible to the trainer."],
  ["Electricians moving into controls", "A step-by-step path from contacts and coils to timers, counters and complete process projects."],
  ["Before and after hands-on training", "Trainees arrive to the physical session already practised, so equipment time is spent on the real thing."],
];
const PRACTICE = [
  ["Seal-in, interlocks and safe stops", "The building blocks of motor and conveyor control, including STOP and E-STOP behaviour."],
  ["Timers, counters and math", "On-delay, off-delay, counting and simple calculations, each checked automatically."],
  ["Complete plants", "Bottling and packing, paint mixing, milk pasteurising, a booster pump station and a three-floor lift."],
  ["Prove it", "A checkpoint with hidden tests and no hints. Passing earns a badge that anyone can verify with a code."],
];
const FAQ = [
  ["Who is it for?", "Technicians, electricians and mechanics learning PLC ladder logic. It starts from zero, and experienced people can move quickly through what they know."],
  ["Does it cover our equipment?", "No. The machines are generic simulations (conveyors, tanks, pumps, lifts, traffic lights). The ladder-logic skills carry over to real PLCs, but it does not replace training on your own equipment."],
  ["What does the trainer see?", "Each person's solved problems, recent activity and checkpoint results for the class they belong to."],
  ["What does IT need to do?", "Usually nothing. It runs in a current browser with nothing to install. If your network filters websites, allow this site's address."],
  ["How do we start?", "With a pilot in a physical class: request one below and we will agree the dates, group size and room set-up."],
];

export default function Employers() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12">
      <Hero title="Technicians who can write the logic."
        lead="Give technicians and electricians PLC practice without tying up a line or a trainer kit. Then see what each of them has proved."
        links={[["Request a pilot", pilotHref()], ["See how teams use it", "#uses"]]} />
      <Section id="uses" title="Where teams use it"><Cards items={USES} /></Section>
      <CourseSection />
      <Section title="What they practise in this tool"><Cards items={PRACTICE} cols="sm:grid-cols-2" /></Section>
      <Section id="pilot" title="Start with a pilot" intro={pilotBlurb()}>
        <a href={pilotHref()} className="inline-block rounded-lg bg-cyan-600 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-500">Request a pilot</a>
      </Section>
      <Section title="Pricing and payment" intro={pricingBlurb()} />
      <Section title="Questions from managers"><Faq items={FAQ} /></Section>
    </main>
  );
}
