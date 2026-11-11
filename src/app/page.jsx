import React from "react";
import Herosection from "@/components/Herosection";
import NearbyPropertiesSection from "@/components/NearbyPropertiesSection";
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
import PersonalizedPropertiesSection from "@/components/PersonalizedPropertiesSection";
import { getApprovedListings, getRecommendedListings, getRotatingSectionsData } from "@/lib/getListings";
import { currentUser } from "@/lib/serverAuth";
import { getUserLocationRecommendations } from "@/lib/locationIntelligence";

export default async function Page() {
  const user = await currentUser();

  let listings = [];
  let commercialListings = [];
  let luxuryListings = [];
  let brandedListings = [];
  let recommendedListings = [];
  let listingsError = false;
  let personalizedLocationData = null;
  let rotatingData = { trending: {}, newLaunch: {}, branded: {}, luxury: {} };

  try {
    const promises = [
      getApprovedListings(),
      getApprovedListings({ propertyType: { in: ["SHOP", "SHOWROOM", "GODOWN", "OFFICE"] } }),
      getApprovedListings({ categories: { some: { category: "LUXURY" } } }),
      getApprovedListings({ categories: { some: { category: "BRANDED" } } }),
      getRecommendedListings(),
      getRotatingSectionsData().catch(() => ({ trending: {}, newLaunch: {}, branded: {}, luxury: {} })),
    ];

    if (user && (user.preferredLocation || user.preferredCity)) {
      promises.push(
        getUserLocationRecommendations(
          user.preferredLocation || user.preferredCity,
          { limit: 12 }
        ).catch(() => null)
      );
    }

    const [latest, commercial, luxury, branded, recommended, rotating, personalized] = await Promise.all(promises);

    listings = latest.listings;
    commercialListings = commercial.listings;
    luxuryListings = luxury.listings;
    brandedListings = branded.listings;
    recommendedListings = recommended.listings;
    rotatingData = rotating || { trending: {}, newLaunch: {}, branded: {}, luxury: {} };
    personalizedLocationData = personalized || null;
  } catch (error) {
    listingsError = true;
    console.error("Homepage listings failed to load:", error);
  }

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <Herosection />

      {personalizedLocationData && (
        <PersonalizedPropertiesSection
          userLocationData={personalizedLocationData}
          user={user}
        />
      )}

      {/* On-Demand Nearby Properties (Location captured only on button click) */}
      <NearbyPropertiesSection />

      <RecommendedProperties listings={recommendedListings} error={listingsError} />
      <FestivalOffer />
      <TrendingProjects groupedData={rotatingData.trending} />
      <NewLaunchProjects groupedData={rotatingData.newLaunch} listings={listings} />
      <BrandedResidences groupedData={rotatingData.branded} listings={brandedListings} />
      <TopLuxuryProjects groupedData={rotatingData.luxury} listings={luxuryListings} />
      <CommercialProjects listings={commercialListings} />
      <SCOProjects listings={commercialListings} />
      <PopularBuilders />
      <BHKLifestyle />
      <WhyChooseBhoomi />
      <CustomerTestimonials />
    </main>
  );
}
