"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { EnterpriseTenancyCard } from "@/components/EnterpriseTenancyCard";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useInitializePaymentMutation,
  useVerifyPaymentMutation,
} from "@/state/api";
import {
  CircleCheckBig,
  Clock,
  Download,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import React from "react";
import { openPaystackPopup } from "@/lib/paystack";
import { downloadAgreement } from "@/lib/downloadAgreement";
import { toast } from 'react-hot-toast';

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: applications,
    isLoading,
    isError,
    refetch,
  } = useGetApplicationsQuery({
    userId: authUser?.cognitoInfo?.userId,
    userType: "tenant",
  });

  const [initializePayment, { isLoading: isInitializingPayment }] =
    useInitializePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const handleProceedPayment = async (leaseId?: number) => {
    if (!leaseId) {
      toast.error("Lease record not found for this approved application.");
      return;
    }

    try {
      const res = await initializePayment({ leaseId }).unwrap();
      if (res.reference) {
        const paystackKey =
          process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
          "pk_test_a2104e5914e6cc6e790ce2c597c34743740cf0b8";

        await openPaystackPopup({
          key: paystackKey,
          email:
            (authUser?.cognitoInfo as any)?.email ||
            (authUser?.userInfo as any)?.email ||
            "tenant@kalrent.com",
          amount: Math.round(res.totalAmount * 100),
          reference: res.reference,
          onSuccess: async (response: any) => {
            try {
              await verifyPayment({
                reference: response.reference || res.reference,
              }).unwrap();
              toast.success(
                "Escrow payment verified! Your tenancy is now active."
              );
            } catch {
              toast("Payment confirmed, refreshing tenancy status...", { icon: "ℹ️" });
            } finally {
              refetch();
            }
          },
          onClose: () => {
            toast("Payment window closed.", { icon: "ℹ️" });
          },
        });
      } else if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (err: any) {
      console.error("Payment initialization error:", err);
    }
  };

  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="Applications"
        subtitle="Track and manage your property rental applications"
      />
      <div className="w-full">
        {applications?.map((application) => {
          const isApproved =
            application.status === "Approved" ||
            application.status === "APPROVED";
          const isPending =
            application.status === "Pending" ||
            application.status === "PENDING";
          const isLeaseActive = application.lease?.status === "ACTIVE";

          const totalUpfront =
            (application.property?.annualRent || 0) +
            (application.property?.agentFee || 0) +
            (application.property?.cautionDeposit || 0) +
            (application.property?.platformFee || 0);

          return (
            <ApplicationCard
              key={application.id}
              application={application}
              userType="renter"
            >
              <div className="flex flex-col gap-4 w-full pb-4 px-4">
                {isLeaseActive && application.lease?.id ? (
                  <EnterpriseTenancyCard
                    leaseId={application.lease.id}
                    propertyName={application.property?.name}
                    propertyAddress={application.property?.location?.address}
                  />
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                    {isApproved ? (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl grow flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                        <div>
                          <div className="flex items-center text-amber-900 font-semibold mb-1">
                            <ShieldCheck className="w-5 h-5 mr-2 text-amber-600 shrink-0" />
                            Application Approved — Escrow Payment Required
                          </div>
                          <p className="text-xs text-amber-800">
                            Total Upfront:{" "}
                            <span className="font-bold text-amber-950">
                              ₦{totalUpfront.toLocaleString()}
                            </span>{" "}
                            (includes Caution Deposit escrow of ₦
                            {application.property?.cautionDeposit?.toLocaleString()}
                            ).
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleProceedPayment(application.lease?.id)
                          }
                          disabled={isInitializingPayment}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap cursor-pointer text-sm"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Proceed to Secure Escrow Payment
                        </button>
                      </div>
                    ) : isPending ? (
                      <div className="bg-yellow-100 p-4 text-yellow-800 grow flex items-center rounded-xl">
                        <Clock className="w-5 h-5 mr-2 shrink-0 text-yellow-600" />
                        Your application is pending manager approval
                      </div>
                    ) : (
                      <div className="bg-red-100 p-4 text-red-800 grow flex items-center rounded-xl">
                        <XCircle className="w-5 h-5 mr-2 shrink-0 text-red-600" />
                        Your application has been denied
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (application.lease?.id) {
                          downloadAgreement(
                            application.lease.id,
                            application.property?.name
                          );
                        } else {
                          toast(
                            "Tenancy agreement will be ready once your application is approved.",
                            { icon: "ℹ️" }
                          );
                        }
                      }}
                      className="bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-xl flex items-center justify-center hover:bg-slate-100 whitespace-nowrap text-sm cursor-pointer self-stretch md:self-auto transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Agreement
                    </button>
                  </div>
                )}
              </div>
            </ApplicationCard>
          );
        })}
      </div>
    </div>
  );
};

export default Applications;
