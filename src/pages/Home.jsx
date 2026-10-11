import HeroSection from "../components/HeroSection";
import CollectionsSection from "../components/CollectionsSection";
import HowToOrderSection from "../components/HowToOrderSection";
import BestSellersSection from "../components/BestSellersSection";
import HowToPaySection from "../components/HowToPaySection";
import OurStorySection from "../components/OurStorySection";
import HomeTrackOrderSection from "../components/HomeTrackOrderSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import CustomerLoveSection from "../components/CustomerLoveSection";
import FAQSection from "../components/FAQSection";
import FinalCTASection from "../components/FinalCTASection";
import AppComingSoon from "../components/AppComingSoon";

function Home() {
  return (
    <>
      <HeroSection />
      <CollectionsSection />
      <HowToOrderSection />
      <BestSellersSection />
      <HowToPaySection />
      <AppComingSoon />
      <OurStorySection />
      <HomeTrackOrderSection />
      <WhyChooseUsSection />
      <CustomerLoveSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}

export default Home;
