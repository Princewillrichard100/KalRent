"use client";

import { useGetAuthUserQuery, useGetPropertyQuery } from "@/state/api";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import Container from "@/components/Container";
import ListingHead from "@/components/listings/ListingHead";
import ListingInfo from "@/components/listings/ListingInfo";
import ListingReservation from "@/components/listings/ListingReservation";
import PropertyOverview from "./PropertyOverview";
import PropertyLocation from "./PropertyLocation";
import ApplicationModal from "./ApplicationModal";
import Loading from "@/components/Loading";
import { Range } from "@/components/inputs/Calendar";
import { addYears } from "date-fns";
import { useLoginModal } from "@/hooks/useLoginModal";

const SingleListing = () => {
  const { id } = useParams();
  const propertyId = Number(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: authUser } = useGetAuthUserQuery();
  const { data: property, isLoading } = useGetPropertyQuery(propertyId);
  const loginModal = useLoginModal();

  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: addYears(new Date(), 1),
    key: "selection",
  });

  if (isLoading || !property) {
    return (
      <Container className="py-8">
        <div className="max-w-screen-lg mx-auto flex flex-col gap-6">
          {/* Skeleton Title & Location Header */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="h-8 w-72 bg-neutral-200 animate-pulse rounded-lg" />
                <div className="h-4 w-48 bg-neutral-100 animate-pulse rounded-md mt-2" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-20 bg-neutral-100 animate-pulse rounded-lg" />
                <div className="h-8 w-20 bg-neutral-100 animate-pulse rounded-lg" />
              </div>
            </div>

            {/* Skeleton 5-Photo Showcase Grid (Locked dimensions: h-[350px] sm:h-[420px] md:h-[480px]) */}
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[350px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden bg-neutral-100">
              <div className="col-span-1 md:col-span-2 row-span-2 bg-neutral-200 animate-pulse" />
              <div className="hidden md:block col-span-1 row-span-1 bg-neutral-200 animate-pulse" />
              <div className="hidden md:block col-span-1 row-span-1 bg-neutral-200 animate-pulse" />
              <div className="hidden md:block col-span-1 row-span-1 bg-neutral-200 animate-pulse" />
              <div className="hidden md:block col-span-1 row-span-1 bg-neutral-200 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            {/* Left: Info Skeletons */}
            <div className="col-span-4 flex flex-col gap-8">
              {/* Host profile skeleton */}
              <div className="flex flex-row items-center justify-between pb-6 border-b border-neutral-200">
                <div className="flex flex-col gap-2">
                  <div className="h-6 w-48 bg-neutral-200 animate-pulse rounded" />
                  <div className="h-4 w-32 bg-neutral-100 animate-pulse rounded" />
                </div>
                <div className="w-14 h-14 rounded-full bg-neutral-200 animate-pulse" />
              </div>

              {/* Kalrent Cover skeleton */}
              <div className="pb-6 border-b border-neutral-200 space-y-2">
                <div className="h-5 w-32 bg-neutral-200 animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-neutral-100 animate-pulse rounded" />
              </div>

              {/* Description skeleton */}
              <div className="pb-6 border-b border-neutral-200 space-y-2">
                <div className="h-5 w-40 bg-neutral-200 animate-pulse rounded" />
                <div className="h-3.5 w-full bg-neutral-100 animate-pulse rounded" />
                <div className="h-3.5 w-5/6 bg-neutral-100 animate-pulse rounded" />
                <div className="h-3.5 w-2/3 bg-neutral-100 animate-pulse rounded" />
              </div>

              {/* Amenities skeleton */}
              <div className="space-y-3">
                <div className="h-5 w-44 bg-neutral-200 animate-pulse rounded" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 bg-neutral-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Sticky Booking Card Skeleton */}
            <div className="col-span-3 order-first md:order-last mb-10 md:mb-0">
              <div className="sticky top-28">
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xl flex flex-col gap-4">
                  <div className="flex justify-between items-baseline">
                    <div className="h-8 w-36 bg-neutral-200 animate-pulse rounded-lg" />
                    <div className="h-6 w-28 bg-neutral-100 animate-pulse rounded-full" />
                  </div>
                  <hr className="border-neutral-100" />
                  <div className="h-14 w-full bg-neutral-100 animate-pulse rounded-xl" />
                  <div className="h-12 w-full bg-neutral-200 animate-pulse rounded-xl" />
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-neutral-100 animate-pulse rounded" />
                      <div className="h-4 w-16 bg-neutral-100 animate-pulse rounded" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-28 bg-neutral-100 animate-pulse rounded" />
                      <div className="h-4 w-16 bg-neutral-100 animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const images =
    property.photoUrls && property.photoUrls.length > 0
      ? property.photoUrls
      : ["/placeholder.jpg"];

  const handleApplyClick = () => {
    if (!authUser) {
      return loginModal.onOpen();
    }
    setIsModalOpen(true);
  };

  return (
    <Container className="py-8">
      <div className="max-w-screen-lg mx-auto flex flex-col gap-6">
        {/* Listing Head: Title, Location, Photos, Heart Button */}
        <ListingHead
          title={property.name}
          imageSrc={images}
          locationValue={`${property.location?.address || property.campusZone}, ${property.location?.city || "Ilorin"}`}
          id={property.id}
          currentUser={authUser}
          campusZone={property.campusZone}
        />

        <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
          {/* Left: Info, Specs, Highlights, Map */}
          <div className="col-span-4 flex flex-col gap-8">
            <ListingInfo
              user={{
                name: property.manager?.name || "Verified Campus Manager",
                email: property.manager?.email,
              }}
              description={property.description}
              bedCount={property.beds}
              bathCount={property.baths}
              propertyType={property.propertyType}
              amenities={property.amenities}
            />

            <hr className="border-slate-100" />
            <PropertyOverview propertyId={propertyId} />

            <hr className="border-slate-100" />
            <PropertyLocation propertyId={propertyId} />
          </div>

          {/* Right: Sticky Booking Card */}
          <div className="col-span-3 order-first md:order-last mb-10 md:mb-0">
            <div className="sticky top-28">
              <ListingReservation
                annualRent={property.annualRent}
                agentFee={property.agentFee}
                cautionDeposit={property.cautionDeposit}
                platformFee={property.platformFee}
                dateRange={dateRange}
                onChangeDate={(range) => setDateRange(range)}
                onSubmit={handleApplyClick}
              />
            </div>
          </div>
        </div>
      </div>

      {authUser && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyId={propertyId}
        />
      )}
    </Container>
  );
};

export default SingleListing;
