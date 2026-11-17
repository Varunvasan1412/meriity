import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import TrustCard from "@/components/sections/TrustCard";
import TrustCheckSection from "@/components/sections/TrustCheckSection";
import Shift from "@/components/sections/Shift";
import Framework from "@/components/sections/Framework";
import Services from "@/components/sections/Services";
import Industries from "@/components/sections/Industries";
import Results from "@/components/sections/Results";
import Metrics from "@/components/sections/Metrics";
import Testimonials from "@/components/sections/Testimonials";
import Why from "@/components/sections/Why";
import Closing from "@/components/sections/Closing";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustCard />
        <TrustCheckSection />
        <Shift />
        <Framework />
        <Services />
        <Industries />
        <Results />
        <Metrics />
        <Testimonials />
        <Why />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
