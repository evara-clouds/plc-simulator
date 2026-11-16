import { SITE } from "@/lib/site";
import QuoteForm from "@/components/QuoteForm";
import { Hero, Section, Cards, Tracks, Price, Faq } from "@/components/OrgBits";

export const metadata = { title: `For schools | ${SITE.name}`, description: "A browser-based controls lab for technical schools and colleges, with an instructor view of every student's progress." };

// EDIT THESE to match what your product really offers.
const FEATURES = [
  ["Every student at a bench", "No waiting for a trainer. 4 trainer benches and 13 machines run in the browser, with a 2D view for slower computers."],
  ["A curriculum from Ohm's law up", "111 interactive lessons on 14 tracks: electricity and safety, motor control, prints, PLC programming, drives, analog, networks and HMI."],
  ["Mistakes that cost nothing", "Lockout, proving dead and fault-finding practiced until they're habits. Lessons follow NFPA 70E, and every lockout is followed by proving zero voltage."],
  ["Scored checkpoints", "One per track, 14 in all: an unseen fault or task, no hints, and a pass mark. Students build a printable record of what they've passed."],
  ["An instructor view", "Each student's lessons, practice and checkpoint results under your class, in one place, for you and the other instructors you add."],
  ["Real PLC work", "Program every machine in the built-in IEC 61131-3 PLC, or connect your own PLC over Modbus TCP, and commission it against the spec."],
];
const TRACKS = [
  ["Electricity and the meter", "Bench check: three unknown parts, one bad"],
  ["Safety for controls work", "Lock out and prove dead on an unseen machine"],
  ["Inputs and outputs", "Wire-up check: a miswired sensor and a dead output"],
  ["Control components", "Find the failed part among five"],
  ["Motor control circuits", "An unseen fault in a reversing starter"],
  ["Reading prints", "Trace three signals on an unseen print"],
  ["Your first real panel", "A solo work order: an unseen fault, no hints"],
  ["PLC programming 1", "A program to a spec: Conveyor 5 from a blank page"],
  ["PLC programming 2", "Program and commission an unseen machine"],
  ["Drives and motion", "An unseen drive fault on the VFD conveyor"],
  ["Analog and process control", "Loop-check and fix a mis-scaled transmitter"],
  ["Industrial networks", "A wrong address and a bad cable"],
  ["HMI and SCADA", "A conveyor operator screen built to a spec"],
  ["Machines and standards", "Capstone: commission a machine end to end from a spec"],
];
const FAQ = [
  ["What computers do students need?", "A recent computer with a current browser (Chrome, Edge, Firefox or Safari). There is a 3D view and a 2D view for slower computers. Nothing is installed."],
  ["How do students sign in?", "With their email address: they get a sign-in code by email, so there are no passwords to manage. We set up your class and seats, and the students you add join it when they sign in."],
  ["Can high school students use it?", "Yes, students 13 and older, each with their own email address (a school-issued one is fine). It isn't for students under 13."],
  ["Does it replace our physical trainers?", "No, and it isn't meant to. It gives every student bench time at once, lets them practice faults and lockout without risk, and gets them reading prints and taking readings before they reach your trainers, so trainer time goes further."],
  ["Can students program PLCs in it?", "Yes. Every machine can be programmed in the built-in PLC (IEC 61131-3, in Structured Text or Ladder Diagram). If your program has PLCs or PLC software that can be a Modbus TCP client, students can connect them to the simulated machines."],
  ["What standards does it follow?", "US practice: NFPA 70E and OSHA 1910.147 for electrical safety and lockout, NFPA 79 and UL 508A for machine wiring and panels, ISA-5.1 symbols on the process prints, and IEC 61131-3 for the PLC."],
  ["How is it priced?", "By quote, for your classes and students. Tell us about your program with the form below and we'll reply by email within one business day. Pay by purchase order: we invoice, due in 30 days, by ACH or bank transfer, check or card, and your class opens when the PO arrives. A W-9 and vendor forms on request; send a tax exemption certificate with the order if you have one."],
];

export default function Schools() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-12">
      <Hero title="A controls lab every student can use."
        lead="Students take readings, trace prints, find faults and program PLCs on simulated machines with full electrical prints, alongside your physical trainers. You see how each of them is doing."
        links={[["See pricing", "#pricing"], ["See how it works", "#how"]]} />
      <Section id="how" title="What your program gets">
        <Cards items={FEATURES} />
        <p className="text-sm italic text-slate-500">Coming next, shaped by the schools using it: assigning tracks with due dates, and a placement check for before-and-after results.</p>
      </Section>
      <Section title="The tracks" intro="Each track ends in a checkpoint. Use them in order as a full course, or pick the ones that fit yours."><Tracks items={TRACKS} /></Section>
      <Section id="pricing" title="Pricing" intro="Priced for your program. Tell us about your classes and we'll send a quote by email.">
        <Price featured name="Education" who="For colleges, CTE and training programs" price="Custom quoted for your classes" points={[
          "111 interactive lessons on 14 tracks, from Ohm's law to networks and HMI",
          "4 trainer benches and 13 machines, each with a full set of prints",
          "Troubleshooting work orders, lockout and PLC programming on every machine",
          "14 scored checkpoints and a printable record for each student",
          "An instructor view of each student's progress and results"]} />
      </Section>
      <Section title="Questions from instructors"><Faq items={FAQ} /></Section>
      <Section id="request" title="Request a quote" intro="Tell us about your class or program. We'll reply by email within one business day with a quote, and answer anything you ask.">
        {SITE.email && <p className="text-sm text-slate-400">Questions first? Email <a className="text-cyan-400 hover:underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>}
        <QuoteForm kind="schools" email={SITE.email} />
        <p className="text-xs text-slate-500">We use this only to reply to you.</p>
      </Section>
    </main>
  );
}
