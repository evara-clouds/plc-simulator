import { SITE } from "@/lib/site";
import { COURSE } from "@/lib/course";
import { Section, Tracks, Cards } from "@/components/OrgBits";

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
