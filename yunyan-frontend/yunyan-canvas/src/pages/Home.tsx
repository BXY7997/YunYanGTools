import { About } from "../components/About";
import { Cta } from "../components/Cta";
import { FAQ } from "../components/FAQ";
import { Features } from "../components/Features";
import { Hero3D } from "../components/Hero3D";
import { HowItWorks } from "../components/HowItWorks";
import { Pricing } from "../components/Pricing";
import { Services } from "../components/Services";
import { Sponsors } from "../components/Sponsors";
import { Testimonials } from "../components/Testimonials";

export const Home = () => {
  return (
    <>
      <Hero3D />
      <Sponsors />
      <Features />
      <About />
      <Services />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Cta />
    </>
  );
};

export default Home;
