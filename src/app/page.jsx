import React from "react";
import Herosection from "@/components/Herosection";
import NearbyPropertiesSection from "@/components/NearbyPropertiesSection";
import RecommendedProperties from "@/components/RecommendedProperties";
import TrendingProjects from "@/components/Trending-Projects-in-Gurugram";
import FestivalOffer from "@/components/FestivalOffer";
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

  let recommendedListings = [];
  let listingsError = false;
  let personalizedLocationData = null;
  let rotatingData = { trending: {} };

  try {
    const promises = [
      getRecommendedListings(),
      getRotatingSectionsData().catch(() => ({ trending: {} })),
    ];

    if (user && (user.preferredLocation || user.preferredCity)) {
      promises.push(
        getUserLocationRecommendations(
          user.preferredLocation || user.preferredCity,
          { limit: 12 }
        ).catch(() => null)
      );
    }

    const [recommended, rotating, personalized] = await Promise.all(promises);

    recommendedListings = recommended.listings;
    rotatingData = rotating || { trending: {} };
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
      <PopularBuilders />
      <BHKLifestyle />
      <WhyChooseBhoomi />
      <CustomerTestimonials />
    </main>
  );
}
