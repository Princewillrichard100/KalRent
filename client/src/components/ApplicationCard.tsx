import { Mail, MapPin, PhoneCall } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ApplicationCard = ({
  application,
  userType,
  children,
}: ApplicationCardProps) => {
  const [imgSrc, setImgSrc] = useState(
    application.property.photoUrls?.[0] || "/placeholder.jpg"
  );

  const isApproved =
    application.status === "Approved" || application.status === "APPROVED";
  const isDenied =
    application.status === "Denied" ||
    application.status === "REJECTED" ||
    application.status === "DENIED";

  const statusBadge = isApproved ? (
    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
      Approved
    </span>
  ) : isDenied ? (
    <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
      Denied
    </span>
  ) : (
    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
      Pending
    </span>
  );

  const contactPerson =
    userType === "manager" ? application.tenant : application.manager;

  return (
    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs bg-white mb-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 md:px-5 py-5 gap-6 lg:gap-4">
        {/* Property Info Section */}
        <div className="flex flex-col lg:flex-row gap-5 w-full lg:w-auto">
          <Image
            src={imgSrc}
            alt={application.property.name}
            width={200}
            height={150}
            className="rounded-xl object-cover w-full lg:w-[200px] h-[150px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold my-1 text-slate-900 tracking-tight">
                {application.property.name}
              </h2>
              <div className="flex items-center text-slate-500 text-xs mb-2">
                <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                <span>{`${application.property.location.city}, ${application.property.location.country}`}</span>
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              ₦{application.property.annualRent?.toLocaleString()}{" "}
              <span className="text-slate-500 text-xs font-normal">/ yr</span>
            </div>
          </div>
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-slate-200 h-48" />

        {/* Status Section */}
        <div className="flex flex-col justify-between w-full lg:basis-2/12 lg:h-48 py-2 gap-3 lg:gap-0">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs font-medium">Status:</span>
              {statusBadge}
            </div>
            <hr className="mt-3 border-slate-100" />
          </div>
          {application.lease ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Start Date:</span>{" "}
                {new Date(application.lease.startDate).toLocaleDateString()}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">End Date:</span>{" "}
                {new Date(application.lease.endDate).toLocaleDateString()}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Next Payment:</span>{" "}
                {new Date(application.lease.nextPaymentDate).toLocaleDateString()}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-500 italic py-2">
              Lease agreement generated upon manager approval
            </div>
          )}
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-slate-100 h-48" />

        {/* Contact Person Section */}
        <div className="flex flex-col justify-start gap-4 w-full lg:basis-3/12 lg:h-48 py-2">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {userType === "manager" ? "Applicant Details" : "Property Manager"}
            </div>
            <hr className="mt-2 border-slate-100" />
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              {contactPerson.name ? contactPerson.name[0]?.toUpperCase() : "U"}
            </div>
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="font-bold text-slate-900 text-sm">{contactPerson.name}</div>
              <div className="flex items-center text-slate-600 gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{contactPerson.phoneNumber || "No phone provided"}</span>
              </div>
              <div className="flex items-center text-slate-600 gap-1.5 truncate max-w-[200px]">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{contactPerson.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};

export default ApplicationCard;
