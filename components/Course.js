import { SITE, pricingBlurb } from "@/lib/site";
import { COURSE, PRICING } from "@/lib/course";
import { Section, Tracks, Cards, Price } from "@/components/OrgBits";

export default function CourseSection() {
  return (
    <Section id="course" title={`The ${COURSE.name} at ${SITE.venue}`}
      intro={`The topics in the course guide. Prices start from ${COURSE.from}. This practice companion supports the PLC part; the other topics are taught in the physical class.`}>
      <Tracks items={COURSE.topics} />
      <Cards items={COURSE.why} cols="sm:grid-cols-2" />
      <p className="text-xs text-slate-500">The practice badge on this site is separate from the course certification.</p>
    </Section>
  );
}

export function PricingSection() {
  return (
    <Section id="pricing" title="Pricing" intro={pricingBlurb()}>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.values(PRICING).map((p) => <Price key={p.name} name={p.name} who={p.who} price={p.price} points={p.points} cta={p.cta} href={`/contact?for=${p.audience}#pilot`} featured={p.audience === "student"} />)}
      </div>
    </Section>
  );
}
