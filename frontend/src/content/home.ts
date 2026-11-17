// All home page copy, sourced from the client PDF "Meriity home page (desktop)".
// Items marked `placeholder: true` are awaiting real client material — never invent them.

export const nav = [
  { label: "Growth Framework", href: "#framework" },
  { label: "Services", href: "#services" },
  { label: "Industries", href: "#industries" },
  { label: "Case Studies", href: "#results" },
  { label: "Insights", href: "#" },
  { label: "About", href: "/about" },
];

// Full-screen menu: one word per link, so the column stays narrow and the type can be huge.
export const menu = [
  { label: "About", href: "/about" },
  { label: "Approach", href: "#framework" },
  { label: "Services", href: "#services" },
  { label: "Sectors", href: "#industries" },
  { label: "Work", href: "#results" },
  // No Insights page yet: point this at it (e.g. "/insights") once it exists.
  { label: "Insights", href: "#" },
  { label: "Contact", href: "#contact" },
];

/** On pages other than home, in-page links ("#services") must point back to the home page. */
export const withBase = (base: string, href: string) => (base && href.startsWith("#") ? `${base}${href}` : href);

export const CTA = {
  trustCheck: { label: "Get my free Trust Check", href: "#contact" },
  growthCall: { label: "Book a Growth Call", href: "#contact" },
};

// Hero background video. Leave empty to use the live 3D chevron scene.
// Put files in frontend/public/video/ and set e.g. "/video/hero.mp4".
export const heroVideo = {
  mp4: "",
  webm: "",
  poster: "",
};

export const hero = {
  statement: "Melbourne growth partner. Strategy-first, senior-led.",
  lead: "You're not losing on price.",
  punch: ["You're losing on", "trust."],
  body: "Every time someone searches for you, reads a review, scrolls your socials or lands on your website, they're deciding whether to trust you. Meriity makes sure every touchpoint tells the same consistent story, so your brand earns trust long before the first conversation.",
  assurances: [
    "Strategy-first, senior-led",
    "Google, Meta, Shopify & Salesforce certified",
    "Your contact is in Melbourne",
  ],
};

export type Rating = 0 | 1 | 2; // needs work, patchy, strong

export const touchpoints = [
  { name: "Searched", check: "Google & AI search", question: "Can they find you on Google and in AI answers?", example: 0 as Rating },
  { name: "Reviewed", check: "Reviews", question: "Do your reviews reassure them?", example: 2 as Rating },
  { name: "Followed", check: "Social proof", question: "Do your socials look active and real?", example: 1 as Rating },
  { name: "Visited", check: "Website", question: "Does your website make enquiring easy?", example: 0 as Rating },
  { name: "Recognised", check: "Brand consistency", question: "Do you look and sound the same everywhere?", example: 1 as Rating },
];

export const ratingLabels = ["Needs work", "Patchy", "Strong"] as const;

export const clients = [
  "VK Lawyers",
  "Hills and Shores",
  "Probiz Finance",
  "WealthStreet Advisers",
  "MiBike Australia",
];

export const shift = {
  title: ["Trust is decided", "before", "the first conversation."],
  body: [
    "People no longer start with a phone call. They search, they ask AI, they read your reviews, they scroll your socials and they judge your website in seconds. If one touchpoint feels thin, dated or says something different, they quietly choose someone else. You never even know they looked.",
    "That's the gap Meriity closes. We build your brand and foundations first, then grow your visibility on top of them, so every touchpoint looks, sounds and feels like the same trusted business.",
  ],
};

export const framework = {
  title: ["Six stages.", "One direction."],
  intro: "Most agencies start with ads. We start with foundations, because campaigns can't fix a business that isn't ready to be found, trusted and chosen.",
  stages: [
    { name: "Assess", body: "A full Trust Check of how your business shows up at every customer touchpoint." },
    { name: "Establish Foundations", body: "Website, analytics, Google Business Profile, CRM and tracking, set up properly before a dollar goes on ads." },
    { name: "Strategise", body: "A clear growth plan tied to your goals, your market and your budget. No guesswork." },
    { name: "Execute", body: "SEO, content, social and campaigns, delivered every month by one accountable team." },
    { name: "Report & Refine", body: "Plain-English reporting on what's working, what isn't, and what we're changing next." },
    { name: "Scale & Sustain", body: "Once it works, we grow it. New channels, new markets and systems that keep the momentum going." },
  ],
};

export const services = {
  title: ["Every part of your growth,", "under one roof."],
  items: [
    { name: "Search & AI Visibility", body: "SEO, Google Ads and AI search, so you're the answer when customers go looking." },
    { name: "Brand, Content & Social", body: "Positioning, messaging, content and social, so you look and sound the same everywhere." },
    { name: "Performance Marketing", body: "Meta and Google campaigns built to bring in enquiries and sales, not just clicks." },
    { name: "Websites & Digital Experience", body: "Fast, modern websites, plus ongoing Website Management with a Melbourne contact." },
    { name: "E-commerce Growth", body: "Shopify stores and marketplaces, with marketing measured in sales." },
    { name: "CRM, Automation & AI", body: "CRM, email and smart automation, so no enquiry ever goes cold." },
  ],
};

export const industries = {
  title: ["Built for businesses where", "trust", "decides the sale."],
  intro: "Clients, patients, families or shoppers: if people check you out before they commit, we can help.",
  items: [
    { name: "Legal firms", body: "Win clients who compare firms online first." },
    { name: "Healthcare & clinics", body: "Help patients choose you with confidence." },
    { name: "Accounting & tax", body: "Stand out in a crowded, referral-led market." },
    { name: "Finance & mortgage brokers", body: "Be the broker people trust with big decisions." },
    { name: "Wealth & financial advice", body: "Show the credibility clients need before they commit." },
    { name: "NDIS & care providers", body: "Reach families looking for care they can rely on." },
    { name: "Education & tutoring", body: "Fill classes with parents who trust you." },
    { name: "Trades & home services", body: "Inspections, pest control and cleaning, booked online." },
    { name: "Events & hospitality", body: "Turn browsers into bookings with a brand that shines." },
    { name: "Professional services", body: "Turn expertise into a name people recognise." },
    { name: "E-commerce", body: "Grow online sales on Shopify and marketplaces." },
  ],
};

export const results = {
  title: ["Proof,", "not promises."],
  items: [
    { sector: "Legal services", client: "VK Lawyers", result: "[Key result]", summary: "[One line on what we did, e.g. SEO, website and social]", placeholder: true },
    { sector: "Property buyers' agents", client: "Hills and Shores", result: "[Key result]", summary: "[One line on what we did]", placeholder: true },
    { sector: "Business finance", client: "Probiz Finance", result: "[Key result]", summary: "[One line on what we did]", placeholder: true },
    { sector: "Wealth advisory", client: "WealthStreet Advisers", result: "[Key result]", summary: "[One line on what we did]", placeholder: true },
  ],
};

// Real testimonials, from meriity.com.
export const testimonials = {
  title: "What our clients are saying",
  items: [
    {
      quote:
        "We partnered with Meriity to boost our online visibility, and the results have been outstanding! Their strategic SEO approach improved our search rankings, engagement, and leads. Highly recommend Meriity for their expertise and transparency!",
      name: "Vinu Kumar",
      role: "Principal Solicitor / Director, VK Lawyers",
    },
    {
      quote:
        "Meriity has expertly managed Hills & Shores – Property Buyers' social media, SEO, and website, boosting our online presence and business growth. Their proactive, data-driven strategies and tailored solutions make them a highly recommended digital partner!",
      name: "Arnab Nandi",
      role: "Founder & Director, Hills and Shores",
    },
    {
      quote:
        "For two years, Meriity has expertly managed Probiz Finance's SEO and social media, boosting visibility, traffic, and lead generation. Their tailored strategies and dedicated service make them an exceptional digital growth partner. Highly recommend!",
      name: "Pooja Choudhary",
      role: "Director, Probiz Finance",
    },
    {
      quote:
        "As a start-up, our goal was to boost brand awareness and generate leads. Meriity's expertise helped us achieve remarkable results with high-quality leads. Their adaptability and support make them a true growth partner!",
      name: "Deepak Prasanth",
      role: "Director, MagicFrames Australia",
    },
    {
      quote:
        "We engaged them to create a short promotional video, and the results were amazing. The team went above and beyond, listened to our suggestions, and delivered an awesome marketing video that truly captured our brand and the services we provide. Thanks again, Meriity!",
      name: "Mario Boudewyn",
      role: "Founder & Director, WealthStreet Advisers",
    },
  ],
};

// Headline metrics, from meriity.com.
export const metrics = [
  { value: 100, suffix: "%", label: "Client satisfaction" },
  { value: 2, suffix: "X", label: "Faster growth" },
  { value: 100, suffix: "%", label: "Client retention" },
  { value: 3, suffix: "X", label: "Conversion rates" },
];

export const why = {
  title: ["A growth partner,", "not another vendor."],
  body: "Founder-led by Deepesh Edappara, a Melbourne Business School alumnus, Meriity brings business strategy to brand and marketing, with a dedicated team that delivers every single month.",
  pillars: [
    { name: "Foundations first", body: "We fix the basics before we spend your money on ads." },
    { name: "A real person in Melbourne", body: "You deal with someone who knows your business, not a ticket queue." },
    { name: "Certified partners", body: "Google, Meta, Shopify and Salesforce certified." },
    { name: "Reporting you can read", body: "Monthly reports in plain English, tied to what matters to you." },
  ],
};

export const closing = {
  title: ["See your business", "the way your customers do."],
  body: "Get a free Trust Check. In one short report, we'll show you what customers find at every touchpoint, where your message breaks down, and what to fix first.",
};

export const footer = {
  tagline: "Make trust visible.",
  blurb: "More than a marketing agency. A true growth partner.",
  address: ["Suite 100, 135 Cardigan Street", "Carlton VIC 3053"],
  phone: { label: "03 9111 5776", href: "tel:+61391115776" },
  email: { label: "info@meriity.com", href: "mailto:info@meriity.com" },
  socials: [
    { label: "LinkedIn", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
  ],
};
