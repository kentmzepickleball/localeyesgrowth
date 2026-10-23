/* The client sites we built, as the websites hero shows them: the first
   screen of each live site, captured October 2026. */

export type ShowcaseSite = {
  key: string;
  name: string;
  kind: string;
  place: string;
  url: string;
  domain: string;
  image: string;
};

const site = (key: string, name: string, kind: string, place: string, url: string): ShowcaseSite => ({
  key,
  name,
  kind,
  place,
  url,
  domain: url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
  image: `/websites/showcase/${key}.webp`,
});

export const SHOWCASE_SITES: ShowcaseSite[] = [
  site("stiir", "Stiir", "Mobile cocktail bar", "New Jersey & NYC", "https://stiirbar.com/"),
  site("side-by-side", "Side by Side Coffee", "Mobile espresso bar", "Portland, ME", "https://sidebysidecoffee.com/"),
  site("social-graze", "Social Graze", "Grazing & specialty carts", "Sacramento, CA", "https://socialgrazecart.com/"),
  site("onward", "Onward Coffee", "Coffee catering", "Huntsville, AL", "https://www.onwardcoffeeco.com/"),
  site("arbour", "Arbour Coffee Co.", "Premium coffee catering", "Raleigh, NC", "https://www.arbourcoffeeco.com/"),
  site("cala", "Cala Coffee", "Roaster, cafés & catering", "Birmingham, AL", "https://calacoffeeco.com/"),
  site("serve", "Serve Coffee", "Specialty coffee catering", "New York, NY", "https://www.servecoffee.nyc/"),
  site("redefined", "Re:defined", "Coffee cart catering", "Dallas Fort Worth, TX", "https://www.redefinedcoffeehouse.com/"),
];

/* Every site we've built, in the order the work ring shows them, light
   and dark in turn. On Set Coffee has no live address we can link to, so
   it shows without one. */
export type WorkSite = Omit<ShowcaseSite, "url" | "domain"> & { url: string | null; domain: string | null };

const byKey = (key: string) => SHOWCASE_SITES.find((s) => s.key === key)!;

export const WORK_SITES: WorkSite[] = [
  byKey("arbour"),
  byKey("stiir"),
  byKey("onward"),
  byKey("redefined"),
  byKey("social-graze"),
  {
    key: "on-set",
    name: "On Set Coffee",
    kind: "Coffee cart catering",
    place: "Los Angeles, CA",
    url: null,
    domain: null,
    image: "/website-project-03.webp",
  },
  byKey("side-by-side"),
  byKey("serve"),
  byKey("cala"),
];
