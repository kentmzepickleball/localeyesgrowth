/* Searches where a client ranks first on Google, each with the
   screenshot it was taken from. Shown on the home page (CaseStudies)
   and the websites page (RankingProof). */

import type { StaticImageData } from "next/image";
import imgNyc from "@/public/nyc-01.webp";
import imgChicago from "@/public/chicago-01.webp";
import imgLa from "@/public/LA-01.webp";
import imgOrlando from "@/public/orlando-01.webp";
import imgDenver from "@/public/denver.webp";
import imgDallasRedefined from "@/public/redefined-dallas-01.webp";
import imgDallasEllie from "@/public/dallas-01.webp";

export type CaseStudy = {
  keyword: string;
  city: string;
  client: string;
  image: StaticImageData;
};

export const CASES: CaseStudy[] = [
  { keyword: "Coffee Catering", city: "NYC", client: "Anecho", image: imgNyc },
  {
    keyword: "Coffee Cart Catering",
    city: "Chicago",
    client: "North Village",
    image: imgChicago,
  },
  {
    keyword: "Coffee Catering",
    city: "LA",
    client: "Always Kind",
    image: imgLa,
  },
  {
    keyword: "Coffee Catering",
    city: "Orlando",
    client: "Take a Shot",
    image: imgOrlando,
  },
  {
    keyword: "Coffee Catering",
    city: "Denver",
    client: "Selah",
    image: imgDenver,
  },
  {
    keyword: "Coffee Catering",
    city: "Dallas",
    client: "Re:defined",
    image: imgDallasRedefined,
  },
  {
    keyword: "Mocktail Cart Catering",
    city: "Dallas",
    client: "Ellie & Juice",
    image: imgDallasEllie,
  },
];
