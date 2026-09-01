import React from "react";
import Herosection from "@/components/Herosection";
import RecommendedProperties from "@/components/RecommendedProperties";
import TrendingProjects from "@/components/Trending-Projects-in-Gurugram";
import NewLaunchProjects from "@/components/NewLaunchProjects";
import FestivalOffer from "@/components/FestivalOffer";
import BrandedResidences from "@/components/BrandedResidences";
import TopLuxuryProjects from "@/components/TopLuxuryProjects";
import CommercialProjects from "@/components/CommercialProjects";
import SCOProjects from "@/components/SCOProjects";
import PopularBuilders from "@/components/PopularBuilders";
import BHKLifestyle from "@/components/BHKLifestyle";
import WhyChooseBhoomi from "@/components/WhyChooseBhoomi";
import CustomerTestimonials from "@/components/CustomerTestimonials";
import Footer from "@/components/Footer";

import cities from "@/app/cities/page.jsx";

export default function Page() {
  return (
    <main>
      <Herosection />
      <RecommendedProperties />
      <TrendingProjects />
      <NewLaunchProjects />
      <FestivalOffer />
      <BrandedResidences/>
      <TopLuxuryProjects/>
      <CommercialProjects/>
      <SCOProjects/>
      <PopularBuilders/>
      <BHKLifestyle/>
      <WhyChooseBhoomi/>
      <CustomerTestimonials/>
      <Footer/>

      <cities/>

    </main>
  );
}