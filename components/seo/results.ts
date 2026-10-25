/* ----------------------------------------------------------------------
   The data behind SeoResults, read off three screenshots from real
   client accounts: the rank report (public/services-01-ranking.png),
   the analytics chart (public/traffic.jpeg) and the booking report
   (public/revenues-localeyes.jpeg). Nothing here is made up: positions
   and climbs are the report's, the curve is traced from the chart, the
   revenue is the booking report's. The marks are where things sit on
   each screenshot, in its own pixels; if a screenshot is replaced, they
   need measuring again.
   ---------------------------------------------------------------------- */

/* position on Jun 23, and how many places each climbed to get there */
export const KEYWORDS = [
  { keyword: "coffee catering service", now: 1, climbed: 68 },
  { keyword: "wedding coffee bar", now: 3, climbed: 41 },
  { keyword: "catering coffee bar", now: 2, climbed: 33 },
  { keyword: "coffee cart catering", now: 2, climbed: 29 },
  { keyword: "coffee bar for events", now: 2, climbed: 22 },
];

/* active users over 30 days, traced from the chart: [how far along it, users] */
export const ACTIVE_USERS: [number, number][] = [
  [0, 211], [0.013, 209], [0.026, 208], [0.039, 213], [0.053, 221], [0.066, 220], [0.079, 220], [0.092, 213],
  [0.105, 207], [0.118, 207], [0.131, 208], [0.145, 213], [0.158, 220], [0.171, 224], [0.184, 233], [0.197, 241],
  [0.21, 246], [0.223, 244], [0.236, 250], [0.25, 250], [0.263, 251], [0.276, 254], [0.289, 263], [0.302, 267],
  [0.315, 268], [0.328, 273], [0.342, 274], [0.355, 274], [0.368, 280], [0.381, 289], [0.394, 290], [0.407, 297],
  [0.42, 313], [0.434, 317], [0.447, 322], [0.46, 326], [0.473, 321], [0.486, 322], [0.499, 322], [0.512, 329],
  [0.526, 344], [0.539, 348], [0.552, 345], [0.565, 341], [0.578, 330], [0.591, 320], [0.604, 316], [0.618, 326],
  [0.631, 335], [0.644, 343], [0.657, 355], [0.67, 355], [0.683, 347], [0.696, 350], [0.709, 355], [0.723, 359],
  [0.736, 365], [0.749, 371], [0.762, 367], [0.775, 357], [0.788, 362], [0.801, 367], [0.815, 360], [0.828, 363],
  [0.841, 363], [0.854, 368], [0.867, 374], [0.88, 382], [0.893, 389], [0.907, 390], [0.92, 396], [0.933, 395],
  [0.946, 393], [0.959, 392], [0.972, 395], [0.985, 398], [1, 405],
];

/* the booking report, quarter over quarter */
export const REVENUE = {
  before: { label: "Jun to Aug 2025", value: 46201.82 },
  after: { label: "Sep to Nov 2025", value: 80799.92 },
};

/* where things sit on each screenshot, in its pixels */
export const MARKS = {
  ranking: {
    /* the "coffee catering service" row, between its rules */
    row: { x: 14, y: 427, w: 1834, h: 126 },
    /* its climb, "↑ 68" */
    climb: { cx: 1397, cy: 491, rx: 94, ry: 40 },
    /* "all now ranking on page one", in the subtitle */
    pageOne: { x0: 437, x1: 852, y: 140 },
  },
  traffic: {
    /* the 30 day line's box: x at the start and the end, y at 0 and per user */
    line: { x0: 74, x1: 759, y0: 701, perUser: 0.973 },
    /* "405" */
    total: { cx: 939, cy: 274, rx: 72, ry: 34 },
  },
  revenue: {
    /* the "↑ 75%" badge */
    badge: { cx: 1159, cy: 206, rx: 100, ry: 46 },
    /* "$80,799.92" */
    total: { x0: 51, x1: 492, y: 300 },
  },
};
