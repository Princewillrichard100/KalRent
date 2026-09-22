"use client";

import Loading from "@/components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetAuthUserQuery,
  useGetLeasesQuery,
  useGetPaymentsQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { Lease, Payment, Property } from "@/types/prismaTypes";
import { EnterpriseTenancyCard } from "@/components/EnterpriseTenancyCard";
import {
  ArrowDownToLineIcon,
  Check,
  CreditCard,
  Download,
  Edit,
  FileText,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

const PaymentMethod = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Secured via KalRent Protected Booking & Paystack.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="w-3.5 h-3.5" />
          Verified Active
        </span>
      </div>

      <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-20 h-12 bg-slate-900 text-emerald-400 font-mono font-bold text-sm flex items-center justify-center rounded-xl shadow-xs shrink-0">
            PAYSTACK
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Direct Debit & Bank Transfer
              </h3>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Cards (Verve, Mastercard, Visa), Bank Transfer & USSD</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
          <span>Caution deposit held securely in escrow until tenancy termination</span>
          <span className="font-medium text-emerald-700">100% Protected</span>
        </div>
      </div>
    </div>
  );
};

const BillingHistory = ({ payments }: { payments: Payment[] }) => {
  const hasPayments = payments && payments.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Billing & Receipt History</h2>
          <p className="text-sm text-slate-500">
            Download your verified payment receipts and lease statements.
          </p>
        </div>
        {hasPayments && (
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 px-4 rounded-xl flex items-center justify-center text-sm font-medium shadow-xs transition-colors self-start sm:self-auto">
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            <span>Download All</span>
          </button>
        )}
      </div>

      {hasPayments ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/80">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Invoice</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Billing Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <TableRow key={payment.id} className="h-16 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="font-medium text-slate-900 text-sm">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                      Invoice #{payment.id} -{" "}
                      {new Date(payment.paymentDate).toLocaleString("default", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        payment.paymentStatus === "Paid" || payment.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {(payment.paymentStatus === "Paid" || payment.paymentStatus === "PAID") && (
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      )}
                      {payment.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-slate-900">
                    ₦{payment.amountPaid.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/50 py-1.5 px-3 rounded-xl font-medium cursor-pointer text-xs transition-colors shadow-xs">
                      <ArrowDownToLineIcon className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-12 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500">
            No billing records or payments yet for this tenancy.
          </p>
        </div>
      )}
    </div>
  );
};

const Residence = () => {
  const { id } = useParams();
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: property,
    isLoading: propertyLoading,
    error: propertyError,
  } = useGetPropertyQuery(Number(id));

  const { data: leases, isLoading: leasesLoading } = useGetLeasesQuery(
    parseInt(authUser?.cognitoInfo?.userId || "0"),
    { skip: !authUser?.cognitoInfo?.userId }
  );
  const { data: payments, isLoading: paymentsLoading } = useGetPaymentsQuery(
    leases?.[0]?.id || 0,
    { skip: !leases?.[0]?.id }
  );

  if (propertyLoading || leasesLoading || paymentsLoading) return <Loading />;
  if (!property || propertyError) {
    return (
      <div className="dashboard-container py-12 text-center">
        <h3 className="text-lg font-bold text-slate-900">Failed to load property details</h3>
        <p className="text-sm text-slate-500 mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const currentLease = leases?.find(
    (lease) => lease.propertyId === property.id
  );

  return (
    <div className="dashboard-container space-y-6">
      {currentLease && (
        <EnterpriseTenancyCard
          leaseId={currentLease.id}
          propertyName={property.name}
          propertyAddress={property.location?.address}
        />
      )}
      <PaymentMethod />
      <BillingHistory payments={payments || []} />
    </div>
  );
};

export default Residence;
