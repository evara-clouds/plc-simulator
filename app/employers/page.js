import { SITE } from "@/lib/site";
import QuoteForm from "@/components/QuoteForm";
import { Hero, Section, Cards, Price, Faq } from "@/components/OrgBits";

export const metadata = { title: `For employers | ${SITE.name}`, description: "Train maintenance techs and electricians on troubleshooting, motor control and PLC work in the browser. Progress by person and team." };

// EDIT THESE to match what your product really offers.
const USES = [
  ["Onboarding new techs", "A set path from meter safety and lockout to reading prints and finding faults, so new employees reach the floor with the basics proven."],
  ["Maintenance to controls", "Grow the electricians and mechanics you have into the controls techs you can't find: motor control, PLCs, drives, analog loops and networks."],
  ["Apprentices", "Related instruction they can do on any computer, with checkpoint results for each apprentice."],
];
const PRACTICE = [
  ["Lock out and prove dead", "Every lockout is followed by proving zero voltage, per NFPA 70E and OSHA 1910.147."],
  ["Find the fault", "Open wires, bad connections, failed devices, power and protection, PLC I/O, installation errors and intermittent faults, found with the prints and a meter."],
  ["Program and commission", "Write the logic to a spec in the built-in IEC 61131-3 PLC, or on your own PLC over Modbus TCP, then commission the machine."],
  ["Prove it", "14 scored checkpoints: an unseen fault or task, no hints, and a pass mark."],
];
const FAQ = [
  ["Who is it for?", "Maintenance techs, electricians and mechanics moving into controls, and new employees who need the basics proven before they work on your equipment. It starts from zero, so mixed experience is fine: experienced people move quickly through what they know."],
  ["Does it cover our equipment?", "The machines are generic industrial equipment: conveyors, sorters, palletizers, pick-and-place, tanks and pumps, a VFD conveyor and more, each with a complete set of prints. The skills (lockout, reading prints, motor control, fault-finding, PLC logic, drives, analog and networks) carry over to any plant. Tell us what's on your floor and we'll point to the tracks that matter."],
  ["What do managers see?", "The lessons, work orders and checkpoint results each person completes under your company, in one place. Managers don't see anyone's personal practice outside the company, or their personal goals."],
  ["What does IT need to do?", "Usually nothing. It runs in a current browser with nothing to install, and people sign in with their work email and a code we email them. If your network filters sites, allow our app domain. The only download is an optional connector (Windows) for people who connect their own PLC over Modbus TCP; it listens on TCP port 502."],
  ["How is it priced and paid?", "By quote, for your team's size. Tell us about your team with the form below and we'll reply by email within one business day. We invoice, due in 30 days, payable by card, ACH or bank transfer, or check. If you need a purchase order, your organization opens when it arrives. A W-9 and vendor forms on request; send a tax exemption certificate with the order if you have one."],
];

export default function Employers() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12">
      <Hero title="Techs who can find the fault."
        lead="Train maintenance techs and electricians on real troubleshooting, motor control and PLC work without tying up a line or opening a live panel. Then see what each of them can do."
        links={[["See pricing", "#pricing"], ["See how teams use it", "#uses"]]} />
      <Section id="uses" title="Where teams use it"><Cards items={USES} /></Section>
      <Section title="Practice on the work itself" intro="Every machine comes with full prints and real faults. A work order reads like one from your floor: a complaint, a machine that won't run, and a meter."><Cards items={PRACTICE} cols="sm:grid-cols-2" /></Section>
      <Section id="pricing" title="Pricing" intro="Priced for your team. Tell us how many people you're training and we'll send a quote by email.">
        <div className="grid gap-4 md:grid-cols-2">
          <Price featured name="Team" who="For teams of up to 25 techs and electricians" price="Custom quoted for your team" points={[
            "111 interactive lessons on 14 tracks, from meter safety to networks and HMI",
            "Troubleshooting work orders on 13 machines, each with a full set of prints",
            "PLC programming and commissioning, in the built-in PLC or your own over Modbus TCP",
            "14 scored checkpoints: an unseen fault or task, no hints",
            "A manager view of each person's progress and results"]} />
          <Price name="Enterprise" who="For more than 25 people, or several sites" price="Custom quoted for your company" points={[
            "Everything in Team", "Volume pricing for your headcount",
            "Tracks chosen with you for the equipment on your floor", "A data processing agreement"]} />
        </div>
      </Section>
      <Section title="Questions from managers"><Faq items={FAQ} /></Section>
      <Section id="request" title="Request a quote" intro="Tell us about your team. We'll reply by email within one business day with a quote, and answer anything you ask.">
        {SITE.email && <p className="text-sm text-slate-400">Questions first? Email <a className="text-cyan-400 hover:underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>}
        <QuoteForm kind="employers" email={SITE.email} />
        <p className="text-xs text-slate-500">We use this only to reply to you.</p>
      </Section>
    </main>
  );
}
