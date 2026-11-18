import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutStory from "@/components/about/AboutStory";
import Vision from "@/components/about/Vision";
import Method from "@/components/about/Method";
import Values from "@/components/about/Values";
import Feedback from "@/components/about/Feedback";
// TEAM: switched off for now. Uncomment this import and <Team /> below to bring the section back.
// import Team from "@/components/about/Team";
import WorkWith from "@/components/about/WorkWith";

export const metadata: Metadata = {
  title: "About | Meriity · Melbourne growth partner",
  description:
    "Meriity is a founder-led Melbourne growth partner. We bring brand, websites and marketing together so the business customers find online is the business you really are.",
};

export default function About() {
  return (
    <>
      <Nav base="/" />
      <main>
        <AboutHero />
        <AboutStory />
        <Vision />
        <Method />
        <Values />
        <Feedback />
        {/* TEAM: switched off for now (see the import above). */}
        {/* <Team /> */}
        <WorkWith />
      </main>
      <Footer base="/" />
    </>
  );
}
