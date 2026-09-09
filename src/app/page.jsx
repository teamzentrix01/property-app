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
import { getApprovedListings } from "@/lib/getListings";

export default async function Page() {
  let listings = [];
  let commercialListings = [];
  let luxuryListings = [];
  let brandedListings = [];
  let listingsError = false;

  try {
    const [latest, commercial, luxury, branded] = await Promise.all([
      getApprovedListings(),
      getApprovedListings({ propertyType: { in: ["SHOP", "SHOWROOM", "GODOWN", "OFFICE"] } }),
      getApprovedListings({ categories: { some: { category: "LUXURY" } } }),
      getApprovedListings({ categories: { some: { category: "BRANDED" } } }),
    ]);
    listings = latest.listings;
    commercialListings = commercial.listings;
    luxuryListings = luxury.listings;
    brandedListings = branded.listings;
  } catch (error) {
    listingsError = true;
    console.error("Homepage listings failed to load:", error);
  }

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <Herosection />
      <RecommendedProperties listings={listings} error={listingsError} />
      <TrendingProjects />
      <NewLaunchProjects listings={listings} />
      <FestivalOffer />
      <BrandedResidences listings={brandedListings}/>
      <TopLuxuryProjects listings={luxuryListings}/>
      <CommercialProjects listings={commercialListings}/>
      <SCOProjects listings={commercialListings}/>
      <PopularBuilders/>
      <BHKLifestyle/>
      <WhyChooseBhoomi/>
      <CustomerTestimonials/>
    </main>
  );
}
