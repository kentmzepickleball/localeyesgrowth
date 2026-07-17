/* ----------------------------------------------------------------------
   GROWTH DIAGNOSTIC — DATA (machine-extracted VERBATIM from the original
   reference/growth-diagnostic-embed.html — the source of truth).
   DO NOT EDIT BY HAND: if the embed changes, re-extract so questions,
   wording, order, points, weights, bands, tiers, and fixes stay identical.
   ---------------------------------------------------------------------- */

export type Option = [text: string, points: number];

export interface Question {
  t: string;
  o: Option[];
}

export interface Fix {
  h: string;
  d: string;
  f: string;
  p: string;
}

export interface Domain {
  id: string;
  name: string;
  label: string;
  weight: number;
  qs: Question[];
  fix: Fix;
}

export interface Tier {
  min: number;
  name: string;
  copy: string;
}

export const DOMAINS: Domain[] = [
  {
    id: "pos",
    name: "Positioning and niche",
    label: "Positioning",
    weight: 8,
    qs: [
      {
        t: "Who do you serve?",
        o: [
          ["One clear niche and ideal client, and we say no to the rest", 100],
          ["A couple of core segments we know well", 65],
          ["Anyone who books, any event", 25],
          ["Honestly not sure yet", 10],
        ],
      },
      {
        t: "If a stranger Googled you and your top three competitors, could they tell you apart in ten seconds?",
        o: [
          [
            "Yes, what makes us different is obvious on our site and profile",
            100,
          ],
          ["Somewhat, if they read closely", 60],
          ["We look like everyone else", 20],
          ["Never checked", 15],
        ],
      },
      {
        t: "Which lane are you in?",
        o: [
          [
            "Deliberately premium, and our pricing, photos, and copy match it",
            100,
          ],
          ["Middle of the market, we compete on value", 60],
          ["We win by being the cheapest", 15],
          ["Have not chosen a lane", 25],
        ],
      },
      {
        t: "Could you say, in one sentence, why clients book you instead of the next result on Google?",
        o: [
          ["Yes, it is written down and on our website", 100],
          ["I could say it roughly if asked", 50],
          ["No", 10],
        ],
      },
    ],
    fix: {
      h: "Positioning and niche",
      d: "You look like every other caterer in your market, so buyers default to comparing on price.",
      f: 'Pick one lane and one ideal client, write the one-sentence "why us," and rebuild your homepage headline and core service page around it.',
      p: "When a dozen local services pages all look alike, buyers pick on price. Operators who niched down report clients paying 2x to 4x premiums once the specialist brand is trusted.",
    },
  },
  {
    id: "offer",
    name: "Offer and packaging",
    label: "Offer",
    weight: 8,
    qs: [
      {
        t: "How do you present what you sell?",
        o: [
          [
            "Two or three tiers, built so the middle option is the obvious pick",
            100,
          ],
          ["Set packages, but really just one option", 60],
          ["Every quote is custom from a price sheet only we see", 50],
          ["We build whatever the client asks for, priced on the fly", 20],
        ],
      },
      {
        t: "Add-ons and upsells (signature drinks, branding, extra services)?",
        o: [
          [
            "A defined add-on menu, offered at the right moment in the sale",
            100,
          ],
          ["A few things we mention informally", 55],
          ["We do not really upsell", 15],
        ],
      },
      {
        t: "Do you have a booking minimum?",
        o: [
          ["Yes, a minimum spend we hold to", 100],
          ["Sort of, we bend it when we are slow", 50],
          ["No, we take everything", 10],
        ],
      },
      {
        t: "Deposits and payment?",
        o: [
          ["Standardized deposit, due dates, and a ready-to-pay link", 100],
          ["We take deposits but the terms vary by client", 50],
          ["We invoice after some back and forth, no set policy", 20],
        ],
      },
    ],
    fix: {
      h: "Offer and packaging",
      d: "Every quote is a one-off, so buyers have nothing to anchor to and you have nothing engineered to sell.",
      f: "Package into three tiers with a deliberately premium anchor on top, and cap the choices. A confused mind does not buy.",
      p: "Operators running three-tier menus report the middle option books about 95 percent of the time, and a high anchor lifts middle-tier selection by roughly 40 percent.",
    },
  },
  {
    id: "price",
    name: "Pricing and margin",
    label: "Pricing",
    weight: 10,
    qs: [
      {
        t: "How were your current prices set?",
        o: [
          [
            "Built up from real costs, including my own labor, plus a target margin",
            100,
          ],
          ["Matched what competitors charge", 50],
          ["Priced what felt affordable to me", 15],
          ["Gut feel when we started, never revisited", 25],
        ],
      },
      {
        t: "Do you know your fixed cost per event (shop, pack, drive, set up, tear down, clean)?",
        o: [
          ["Yes, close to the dollar", 100],
          ["Rough idea", 50],
          ["No", 10],
        ],
      },
      {
        t: "When did prices last go up?",
        o: [
          [
            "We raise on a system (every handful of events, or whenever bookings come too easily)",
            100,
          ],
          ["Within the last year", 70],
          ["Over a year ago", 30],
          ["Never", 10],
        ],
      },
      {
        t: "Of the quotes you send, roughly what share books?",
        o: [
          ["Around 15 to 30 percent", 100],
          ["Over 40 percent, almost everyone says yes", 50],
          ["Under 10 percent", 35],
          ["No idea, we do not track it", 15],
        ],
      },
    ],
    fix: {
      h: "Pricing and margin",
      d: "Prices set by feel or by competitors usually means priced out of your own wallet and underwater on real costs.",
      f: "Rebuild your price from the full cost stack. Every event carries roughly $300 to $500 of fixed cost before you serve anyone. Then raise on a signal: zero-friction bookings mean the price is too low.",
      p: "A healthy quote-to-booking rate is 15 to 30 percent; near-100 percent means underpriced. Operators who reprice on this signal add margin without losing volume.",
    },
  },
  {
    id: "found",
    name: "Getting found online",
    label: "Getting found",
    weight: 15,
    qs: [
      {
        t: "Your website today:",
        o: [
          [
            "Fast, mobile-friendly site on our own domain, built to turn visitors into inquiries",
            100,
          ],
          ["We have a site but it is dated, slow, or DIY", 60],
          ["A free site builder page or link in bio only", 30],
          ["No website", 0],
        ],
      },
      {
        t: "Your homepage headline (the big text at the top):",
        o: [
          [
            'It names our service and our city, like "Coffee Catering Austin"',
            100,
          ],
          ["It is a tagline or our business name", 30],
          ["I do not know what it says", 20],
        ],
      },
      {
        t: "Do you have separate pages for each service and each city you serve?",
        o: [
          ["Yes, both, and they link to each other", 100],
          ["Some service pages, no city pages", 60],
          ["One page covers everything", 25],
          ["No website", 0],
        ],
      },
      {
        t: 'Search "[your service] catering [your city]" right now. Where are you?',
        o: [
          ["Top three results", 100],
          ["Page one", 70],
          ["Page two or nowhere", 20],
          ["Never checked", 25],
        ],
      },
      {
        t: "On a phone, your site:",
        o: [
          [
            "Loads fast, and the first screen shows what we do, where, and how to inquire",
            100,
          ],
          ["Looks great but heavy (big videos, slow load)", 40],
          ["Not sure how it performs on mobile", 25],
        ],
      },
    ],
    fix: {
      h: "Getting found online",
      d: "You are invisible for the exact searches that carry ready-to-book buyers.",
      f: "Make the homepage headline name your service and city, and build dedicated service and location pages that link to each other. This is the single highest-ROI website change a caterer can make.",
      p: "Fixing the headline alone has moved caterer sites from page three to page one. One coffee catering client went from about 1 lead a day to about 5 within two weeks of a redesign plus location pages. Roughly 75 percent of Google traffic goes to the top three results.",
    },
  },
  {
    id: "gbp",
    name: "Google Business Profile and reviews",
    label: "GBP + reviews",
    weight: 15,
    qs: [
      {
        t: "Your Google Business Profile:",
        o: [
          [
            'Verified with a physical address in our service area, set to a caterer category (like "Mobile caterer")',
            100,
          ],
          [
            "Verified as a service-area business (no public address), caterer category",
            65,
          ],
          [
            "Verified, but I could not tell you the category or how it is set up",
            40,
          ],
          ["Not claimed, not verified, or does not exist", 0],
        ],
      },
      {
        t: "How many Google reviews do you have?",
        o: [
          ["100 or more", 100],
          ["30 to 99", 75],
          ["10 to 29", 45],
          ["Under 10", 15],
        ],
      },
      {
        t: "How do reviews get asked for?",
        o: [
          [
            "Both: staff are trained to ask in person at every event (QR on site), AND an automated post-event request goes out with follow-ups",
            100,
          ],
          [
            "One or the other: in-person asks at events, or an automated post-event request, not both",
            65,
          ],
          ["We ask sometimes when we remember", 35],
          ["Rarely or never", 10],
        ],
      },
      {
        t: "Do you reply to reviews?",
        o: [
          ["Every single one", 100],
          ["Sometimes", 50],
          ["Never", 15],
        ],
      },
      {
        t: "How alive is your profile?",
        o: [
          ["Fresh photos and a post at least monthly", 100],
          ["Occasional updates", 50],
          ["Set it up once and have not touched it", 20],
        ],
      },
    ],
    fix: {
      h: "Google Business Profile and reviews",
      d: "Your profile is buried (wrong setup, thin reviews, dormant), so the map pack sends bookings to competitors.",
      f: "Verify the profile with a physical address in your service area and the right caterer category (address-verified profiles beat service-area listings almost every time), then run the two-part review system: staff trained to ask in person at every event, plus an automated post-event request with follow-ups.",
      p: "A profile with 10 more reviews than a competitor will usually outrank 100 directory listings, and map-pack ranking can drive about 10x more leads than the number-one organic result.",
    },
  },
  {
    id: "lead",
    name: "Where your leads come from",
    label: "Lead gen",
    weight: 10,
    qs: [
      {
        t: "Do you know where your leads come from?",
        o: [
          ["Yes, I track it and know the real numbers", 100],
          ["I have a feeling, but no numbers", 50],
          ["I do not know", 15],
        ],
      },
      {
        t: "Where do most of your leads come from today?",
        o: [
          ["Google (search, Maps, our profile)", 100],
          ["Referrals and repeat clients", 70],
          ["Paid directories like The Knot, Thumbtack, Bark", 40],
          ["Instagram and social", 35],
          ["Not enough leads to say", 10],
        ],
      },
      {
        t: "How many lead sources could you count on next month?",
        o: [
          ["Three or more that reliably produce", 100],
          ["Two", 70],
          ["One", 40],
          ["Leads are unpredictable", 10],
        ],
      },
      {
        t: "Venues, planners, and other vendors:",
        o: [
          [
            "We are on preferred-vendor lists and have active referral partners",
            100,
          ],
          ["A few informal relationships", 55],
          ["None", 15],
        ],
      },
      {
        t: "When a lead comes in from anywhere (DM, directory, Google), where does it go?",
        o: [
          [
            "Into our own form and system every time, so we own the data and the follow-up",
            100,
          ],
          ["Partially, some live in DMs and inboxes", 55],
          ["Leads live wherever they landed", 20],
        ],
      },
    ],
    fix: {
      h: "Lead generation mix",
      d: "One fragile lead source (or rented ones, like directories and DMs) decides whether you eat next month.",
      f: "Add the amplifier channel: venues, planners, and photographers. One aligned planner touches about 100 events a year, and almost nobody does this outreach.",
      p: "Of roughly 80 to 100 mobile bars in one major metro, a central venue owner said only two had ever reached out. The preferred-vendor list is usually wide open.",
    },
  },
  {
    id: "sales",
    name: "Sales and follow-up",
    label: "Sales",
    weight: 12,
    qs: [
      {
        t: "A lead inquires on a Tuesday afternoon. When do they hear back?",
        o: [
          ["Within minutes, automated or live", 100],
          ["Within a few hours", 60],
          ["Same day", 35],
          ["Next day or later", 10],
        ],
      },
      {
        t: "How fast can a lead see a price?",
        o: [
          [
            'Instantly (instant quote, or clear "starting at" pricing on the site)',
            100,
          ],
          ["Within hours of submitting our form", 65],
          ["Only after a call, usually days later", 30],
        ],
      },
      {
        t: "A warm lead goes quiet. What happens?",
        o: [
          [
            "We follow up on a cadence until we get a clear yes or no, five or more touches",
            100,
          ],
          ["Two or three touches, then we let it go", 55],
          ["One reply, then we wait", 20],
        ],
      },
      {
        t: "Do you know your close rate?",
        o: [
          ["Yes, tracked in a CRM or sheet", 100],
          ["Roughly", 50],
          ["No", 15],
        ],
      },
      {
        t: "Your phone number:",
        o: [
          ["Visible on the site, and calls get answered by a person", 100],
          ["Visible, but it usually goes to voicemail", 55],
          ["Not on the site", 20],
        ],
      },
    ],
    fix: {
      h: "Sales and follow-up",
      d: "Slow first response and thin follow-up are quietly handing your bookings to whoever answers first.",
      f: "Get first response under 5 minutes (automation counts) and follow up until you get an explicit yes or no.",
      p: "Responding within 5 minutes makes you roughly 70x more likely to close than waiting a day. Quotes sent within 5 minutes book at 23 to 25 percent versus about 14 percent a day later. Buyers pick the first vendor to respond about half the time.",
    },
  },
  {
    id: "ret",
    name: "Client experience and repeat business",
    label: "Retention",
    weight: 8,
    qs: [
      {
        t: "How much of your business comes back?",
        o: [
          [
            "A solid base: repeat clients and recurring bookings are a big share of revenue",
            100,
          ],
          ["Some repeats here and there", 60],
          ["Mostly one-and-done", 25],
          ["I do not actually know", 20],
        ],
      },
      {
        t: "Corporate clients:",
        o: [
          [
            "Recurring corporate work on the calendar (quarterly events, office service, contracts)",
            100,
          ],
          ["Some corporate one-offs", 60],
          ["None, mostly weddings and private parties", 30],
        ],
      },
      {
        t: "After an event ends:",
        o: [
          [
            "Wrap-up message, review ask, and we reach back out before their next occasion",
            100,
          ],
          ["A thank-you, sometimes", 50],
          ["Event ends, relationship ends", 15],
        ],
      },
      {
        t: "Referrals:",
        o: [
          [
            "Engineered: we ask, and partners have a reason to send us work",
            100,
          ],
          ["They happen organically", 55],
          ["Rarely", 20],
        ],
      },
    ],
    fix: {
      h: "Client experience and retention",
      d: "Every event is a one-off, so you re-buy every dollar of revenue instead of compounding it.",
      f: "Install a post-event loop (wrap-up, review ask, pre-occasion nudge) and pitch repeat corporate clients a rebooking program.",
      p: "Operators with a retention system see 40 to 50 percent of clients book twice or more, and a client who books three times has about a 70 percent chance of becoming a regular.",
    },
  },
  {
    id: "ops",
    name: "Operations and tech",
    label: "Operations",
    weight: 6,
    qs: [
      {
        t: "Where does your business actually live?",
        o: [
          ["A CRM (HoneyBook, Dubsado, or similar) with automations", 100],
          ["Organized spreadsheets and a calendar", 55],
          ["My inbox and my memory", 15],
        ],
      },
      {
        t: "How do inquiries come in?",
        o: [
          [
            "A structured form that creates the lead in our system and replies instantly",
            100,
          ],
          ["A contact form that emails us", 55],
          ["DMs and email only", 20],
        ],
      },
      {
        t: "What runs without you touching it?",
        o: [
          [
            "Several things: instant reply, review request, payment reminders, follow-ups",
            100,
          ],
          ["One or two automations", 55],
          ["Nothing is automated", 15],
        ],
      },
      {
        t: "Packing and event logistics:",
        o: [
          [
            "Checklists, packing lists, and an event brief anyone on the team can run from",
            100,
          ],
          ["It is in my head, and it mostly works", 50],
          ["We scramble more than I would like", 20],
        ],
      },
    ],
    fix: {
      h: "Operations and tech",
      d: "The business lives in your inbox and your head, which caps speed, consistency, and your ability to step away.",
      f: "One CRM with a structured intake form and an instant reply on submit. That single automation wins the who-responds-first race every time.",
      p: "Being slow to quote costs operators close to 40 percent of potential revenue. An instant-reply system removes that loss without hiring anyone.",
    },
  },
  {
    id: "team",
    name: "Team and capacity",
    label: "Team",
    weight: 4,
    qs: [
      {
        t: "Who works your events?",
        o: [
          ["A trained team that runs events without me there", 100],
          ["Staff help, but I am at every event", 55],
          ["Just me", 25],
        ],
      },
      {
        t: "What is capping your growth right now?",
        o: [
          ["Nothing, capacity is ahead of demand", 100],
          ["Capacity: we turn away events we could not staff or equip", 55],
          ["Demand: not enough leads", 30],
          ["Me: everything runs through me", 20],
        ],
      },
      {
        t: "Could the business run for two weeks without you?",
        o: [
          ["Yes", 100],
          ["Partially", 50],
          ["Not a chance", 15],
        ],
      },
      {
        t: "Staffing setup:",
        o: [
          [
            "Documented hiring process, and staff are classified properly (W2 where required, insured)",
            100,
          ],
          [
            "We have staff, but it is informal (friends, 1099s, no real process)",
            40,
          ],
          ["No staff yet, it is just me", 50],
        ],
      },
    ],
    fix: {
      h: "Team and capacity",
      d: "You are the ceiling: every event, quote, and decision runs through you.",
      f: "Delegate the lowest-leverage task first (serving), using the chunked handoff: they break down, then they serve while you set up, then full events solo.",
      p: "Owners stuck working every event lose the big inquiries that arrive mid-event, and each added cart or crew supports roughly $100k a year in bookings.",
    },
  },
  {
    id: "seas",
    name: "Seasonality and planning",
    label: "Seasonality",
    weight: 4,
    qs: [
      {
        t: "How far out is your calendar booked?",
        o: [
          ["Two to three months or more, consistently", 100],
          ["A few weeks", 55],
          ["Mostly last-minute", 25],
        ],
      },
      {
        t: "Do you market each season before it arrives (holiday outreach in September, wedding pages in late winter)?",
        o: [
          [
            "Yes, we run a marketing calendar that leads the season by two to three months",
            100,
          ],
          ["Sometimes", 50],
          ["No, we react when it gets slow", 15],
        ],
      },
      {
        t: "What happens in your slow months?",
        o: [
          [
            "A project list: website, content, reviews, outreach, maintenance",
            100,
          ],
          ["We rest and wait for it to pick up", 40],
          ["We panic and discount", 10],
        ],
      },
      {
        t: "Cash through the slow season:",
        o: [
          ["Reserves set aside from the busy months, on purpose", 100],
          ["Usually fine, sometimes tight", 55],
          ["January and February hurt every year", 20],
        ],
      },
    ],
    fix: {
      h: "Seasonality and planning",
      d: "You ride the demand curve instead of planning for it, so peaks catch you understaffed and troughs catch you broke.",
      f: "Market every season two to three months early (holiday outreach starts in September) and give the slow season a project list: website, content, reviews, partner outreach.",
      p: "Operators who prospect the holidays early report $50,000 to $80,000 booked in three months. By November, clients have already booked someone else.",
    },
  },
];

export const TIERS: Tier[] = [
  {
    min: 80,
    name: "Growth Engine",
    copy: "You run the playbook most caterers never build. The job now is compounding and defending what you have.",
  },
  {
    min: 65,
    name: "Booked but Capped",
    copy: "The engine works. A few specific fixes separate you from the operators who own their market.",
  },
  {
    min: 50,
    name: "Found Sometimes",
    copy: "You show up for some searches and close some leads, but the funnel leaks at several points. The two biggest leaks are below.",
  },
  {
    min: 0,
    name: "The Obscurity Zone",
    copy: "Great product, invisible business. Buyers cannot find you, so they book whoever they can find. The good news: the fixes are known, and they are below.",
  },
];

/* intake + 11 domains + email gate */
export const TOTAL_STEPS = DOMAINS.length + 2;
