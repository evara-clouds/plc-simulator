// The course Centurion Systems Limited offers (from its course guide flyer).
// Edit this file to change the programme shown on the site.
// Only "PLC" is practised in this tool. Everything else is taught in the physical class.
const PRACTISED = "Practised in this tool: 36 problems, from a single contact to complete plants";
const IN_CLASS = "Taught in the physical class";

export const COURSE = {
  name: "Automation course",
  from: "KES 25,000",
  topics: [
    ["PLC: programmable logic controllers", PRACTISED],
    ["SCADA: supervision, control and data acquisition", IN_CLASS],
    ["Power protection", IN_CLASS],
    ["VFDs: variable speed drives", IN_CLASS],
    ["Mechatronics", IN_CLASS],
    ["Hydraulics", IN_CLASS],
    ["Instrumentation and calibration", IN_CLASS],
    ["Industrial data networks", IN_CLASS],
    ["Lean production and value stream mapping", IN_CLASS],
    ["Soft skills for Industry 4.0", IN_CLASS],
    ["Entrepreneurship in Industry 4.0", IN_CLASS],
    ["Women in engineering", IN_CLASS],
    ["And many more", "Ask us for the full list"],
  ],
  why: [
    ["Hands-on training", "75% practical."],
    ["Experienced instructors", "Taught by experienced instructors."],
    ["Flexible schedules", "Including evening classes."],
    ["Certification", "Certifications including all major OEMs and NITA."],
  ],
};
