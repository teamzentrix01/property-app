import React from "react";
import Herosection from "@/components/Herosection";
import NearbyPropertiesSection from "@/components/NearbyPropertiesSection";
import RecommendedProperties from "@/components/RecommendedProperties";
import UserActivitySidebar from "@/components/UserActivitySidebar";
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
    <main className="w-full max-w-full">
      {/* 1. Hero Section (Banner) */}
      <Herosection />

      {/* 2. Main Page Body Container: Left side scrolls all sections, Right side is STICKY from banner till footer */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN: All Homepage Sections that scroll smoothly together */}
          <div className="min-w-0 space-y-12 lg:space-y-16 lg:col-span-8 xl:col-span-9">
            {personalizedLocationData && (
              <PersonalizedPropertiesSection
                userLocationData={personalizedLocationData}
                user={user}
              />
            )}

            {/* On-Demand Nearby / Detected Location Properties */}
            <NearbyPropertiesSection />

            {/* Recommended Properties (Now positioned right below Detected Location section) */}
            <RecommendedProperties listings={recommendedListings} error={listingsError} />

            <FestivalOffer />
            <TrendingProjects groupedData={rotatingData.trending} />
            <PopularBuilders />
            <BHKLifestyle />
            <WhyChooseBhoomi />
            <CustomerTestimonials />
          </div>

          {/* RIGHT COLUMN: Sticky User Activity & Post Property Sidebar */}
          {/* Remains pinned on screen as user scrolls down all sections until reaching the footer */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 self-stretch">
            <div className="sticky top-24 z-30">
              <UserActivitySidebar />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
