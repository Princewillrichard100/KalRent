"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api";
import {
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Inbox,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { downloadAgreement } from "@/lib/downloadAgreement";
import { toast } from 'react-hot-toast';

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    {
      userId: authUser?.cognitoInfo?.userId,
      userType: "manager",
    },
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );
  const [updateApplicationStatus, { isLoading: isUpdating }] =
    useUpdateApplicationStatusMutation();

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateApplicationStatus({ id, status }).unwrap();
      toast.success(
        status === "APPROVED"
          ? "Application approved! Rental agreement confirmed."
          : "Application updated."
      );
    } catch {
      toast.error("Failed to update application status.");
    }
  };

  if (isLoading) return <Loading />;
  if (isError || !applications) {
    return (
      <div className="dashboard-container py-12 text-center">
        <h3 className="text-lg font-bold text-slate-900">Failed to load applications</h3>
        <p className="text-sm text-slate-500 mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const filteredApplications = applications.filter((application) => {
    if (activeTab === "all") return true;
    return application.status.toLowerCase() === activeTab;
  });

  return (
    <div className="dashboard-container space-y-6">
      <Header
        title="Applications"
        subtitle="Review student tenant applications, verify profiles, and issue leases"
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 inline-flex w-full sm:w-auto">
          <TabsTrigger
            value="all"
            className="rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-xs px-4 py-2"
          >
            All ({applications.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-xs px-4 py-2"
          >
            Pending (
            {applications.filter((a) => a.status.toLowerCase() === "pending").length}
            )
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-xs px-4 py-2"
          >
            Approved (
            {applications.filter((a) => a.status.toLowerCase() === "approved").length}
            )
          </TabsTrigger>
          <TabsTrigger
            value="denied"
            className="rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-xs px-4 py-2"
          >
            Denied (
            {
              applications.filter(
                (a) =>
                  a.status.toLowerCase() === "denied" ||
                  a.status.toLowerCase() === "rejected"
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>

        {["all", "pending", "approved", "denied"].map((tab) => {
          const tabApplications = applications.filter(
            (application) =>
              tab === "all" ||
              application.status.toLowerCase() === tab ||
              (tab === "denied" && application.status.toLowerCase() === "rejected")
          );

          return (
            <TabsContent key={tab} value={tab} className="mt-6 space-y-4">
              {tabApplications.length > 0 ? (
                tabApplications.map((application) => {
                  const statusUpper = application.status.toUpperCase();
                  const isApproved = statusUpper === "APPROVED";
                  const isPending = statusUpper === "PENDING";
                  const isDenied =
                    statusUpper === "REJECTED" || statusUpper === "DENIED";

                  return (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      userType="manager"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full p-4 bg-slate-50/60 rounded-xl border border-slate-100">
                        {/* Status Notice */}
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                          {isApproved ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Approved • Lease Created</span>
                            </div>
                          ) : isPending ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span>Awaiting Manager Decision</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Application Denied</span>
                            </div>
                          )}

                          <span className="text-slate-500 text-xs hidden sm:inline">
                            Submitted {new Date(application.applicationDate).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                          <Link
                            href={`/managers/properties/${application.property.id}`}
                            className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 py-2 px-3.5 rounded-xl flex items-center justify-center text-xs font-medium transition-colors shadow-xs"
                            scroll={false}
                          >
                            <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                            Property
                          </Link>

                          {isApproved && (
                            <button
                              onClick={() => {
                                if (application.lease?.id) {
                                  downloadAgreement(
                                    application.lease.id,
                                    application.property?.name
                                  );
                                } else {
                                  toast.error(
                                    "Lease record not found for this approved application."
                                  );
                                }
                              }}
                              className="border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/40 py-2 px-3.5 rounded-xl flex items-center justify-center cursor-pointer text-xs font-medium transition-colors shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                              Agreement
                            </button>
                          )}

                          {isPending && (
                            <>
                              <button
                                disabled={isUpdating}
                                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                                onClick={() =>
                                  handleStatusChange(application.id, "APPROVED")
                                }
                              >
                                Approve
                              </button>
                              <button
                                disabled={isUpdating}
                                className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                                onClick={() =>
                                  handleStatusChange(application.id, "REJECTED")
                                }
                              >
                                Deny
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </ApplicationCard>
                  );
                })
              ) : (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No applications in this category
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    New student applications submitted for your properties will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Applications;
