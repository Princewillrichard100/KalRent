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
    return <Loading />;
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
