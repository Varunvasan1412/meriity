// About page copy. Facts come from the home page content and meriity.com.
// Items marked `placeholder: true` are awaiting real client material — never invent them.

export const aboutHero = {
  label: "Who we are",
  lines: ["Trust", "builders"],
  cta: { label: "Let's work", href: "/#contact" },
};

// Leave empty to show the animated chevron fallback. Put files in frontend/public/video/.
export const aboutVideo = {
  mp4: "/video/about-hero-v2.mp4",
  webm: "",
  poster: "/video/about-hero-v2.jpg",
  need: "A slow, cinematic brand film: the team at work in Carlton, screens, whiteboards.",
};

export const aboutStory = {
  label: "About us",
  text: "Every touchpoint tells a story, and at Meriity we make sure it's one people trust. From strategy to execution, we bring brand, websites and marketing together, so the business customers find online is the business you really are.",
  tags: ["Melbourne", "Growth partner"],
  founder: {
    name: "Deepesh Edappara",
    role: "Founder, Meriity",
    initials: "DE",
    line: "Founder-led by a Melbourne Business School alumnus, bringing business strategy to brand and marketing, with a dedicated team that delivers every single month.",
    partnersLabel: "Certified partners",
    partners: ["Google", "Meta", "Shopify", "Salesforce"],
  },
  cards: [
    { title: "Measurable", sub: "Client retention", value: 100, suffix: "%", body: "Clients stay because the work shows up in their numbers." },
    { title: "Focused", sub: "Conversion rates", value: 3, suffix: "X", body: "Enquiries and sales, not vanity clicks and impressions." },
  ],
  feature: {
    title: "Strategy-first",
    sub: "Senior-led growth",
    heading: "Brands people trust on sight",
    cta: { label: "Book a Growth Call", href: "/#contact" },
  },
};

export const vision = {
  lines: ["Built on trust,", "not hype"],
  milestones: [
    { tag: "Founded", pill: "Founder-led", need: "Portrait of Deepesh Edappara, founder." },
    { tag: "Grounded", pill: "Carlton, VIC", need: "The Carlton office, or the team at work." },
    { tag: "Certified", pill: "Google · Meta · Shopify", need: "Team photo, or the partner badges on a wall." },
  ],
};

export const method = {
  label: "Method",
  lines: ["How we", "work"],
  steps: [
    { name: "Assess & Diagnose", body: "A full Trust Check of every customer touchpoint, so we know exactly where trust breaks." },
    { name: "Build the Foundations", body: "Website, tracking, Google Business Profile and CRM, set up properly before a dollar goes on ads." },
    { name: "Grow, Report & Refine", body: "SEO, content, social and campaigns every month, with plain-English reporting on what's working." },
  ],
  video: { mp4: "/video/about-method-v2.mp4", poster: "/video/about-method-v2.jpg" },
  need: "A looping film of the six-stage growth framework.",
};

export const values = {
  label: "Values",
  title: "Core principles",
  rows: [
    ["Trust", "Clarity", "Consistency", "Ownership"],
    ["Strategy", "Craft", "Partnership", "Honesty"],
    ["Momentum", "Precision", "Curiosity", "Care"],
    ["Transparency", "Impact", "Simplicity", "Accountability"],
  ],
};

export const feedback = {
  label: "Testimonials",
  lines: ["Client", "feedback", "that matters"],
  // Client and partner wordmarks shown as type until real logo files are supplied.
  marks: [
    "VK Lawyers",
    "Hills and Shores",
    "Probiz Finance",
    "WealthStreet",
    "MiBike Australia",
    "MagicFrames",
    "Google Partner",
    "Meta Partner",
    "Shopify Partner",
  ],
};

export const team = {
  label: "Team",
  lines: ["Meet the", "powerhouse"],
  members: [
    { name: "Deepesh Edappara", role: "Founder", need: "Portrait of Deepesh.", placeholder: false },
    { name: "[Team member]", role: "[Role]", need: "Team portrait.", placeholder: true },
    { name: "[Team member]", role: "[Role]", need: "Team portrait.", placeholder: true },
    { name: "[Team member]", role: "[Role]", need: "Team portrait.", placeholder: true },
    { name: "[Team member]", role: "[Role]", need: "Team portrait.", placeholder: true },
    { name: "[Team member]", role: "[Role]", need: "Team portrait.", placeholder: true },
  ],
};

export const workWith = { text: "Work with Meriity", href: "/#contact" };
