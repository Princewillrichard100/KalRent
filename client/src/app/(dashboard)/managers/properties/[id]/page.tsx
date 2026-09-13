"use client";

import Header from "@/components/Header";
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
  useGetPropertyPaymentsQuery,
  useGetPropertyLeasesQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { ArrowDownToLine, ArrowLeft, Check, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { downloadAgreement } from "@/lib/downloadAgreement";

const PropertyTenants = () => {
  const { id } = useParams();
  const propertyId = Number(id);

  const { data: property, isLoading: propertyLoading } =
    useGetPropertyQuery(propertyId);
  const { data: leases, isLoading: leasesLoading } =
    useGetPropertyLeasesQuery(propertyId);
  const { data: payments, isLoading: paymentsLoading } =
    useGetPropertyPaymentsQuery(propertyId);

  if (propertyLoading || leasesLoading || paymentsLoading) return <Loading />;

  const getCurrentMonthPaymentStatus = (leaseId: number) => {
    const currentDate = new Date();
    const currentMonthPayment = payments?.find(
      (payment) =>
        payment.leaseId === leaseId &&
        new Date(payment.dueDate).getMonth() === currentDate.getMonth() &&
        new Date(payment.dueDate).getFullYear() === currentDate.getFullYear()
    );
    return currentMonthPayment?.paymentStatus || "Not Paid";
  };

  const hasLeases = leases && leases.length > 0;

  return (
    <div className="dashboard-container space-y-6">
      {/* Back to properties page */}
      <Link
        href="/managers/properties"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-700 transition-colors"
        scroll={false}
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to Properties</span>
      </Link>

      <Header
        title={property?.name || "Property Management"}
        subtitle="Manage tenants, lease terms, and statutory tenancy agreements"
      />

      <div className="w-full space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Tenants & Leases</h2>
              <p className="text-sm text-slate-500">
                Active student tenants, annual rent schedules, and compliance agreements.
              </p>
            </div>
            {hasLeases && (
              <button
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 px-4 rounded-xl flex items-center justify-center text-sm font-medium shadow-xs transition-colors self-start sm:self-auto"
              >
                <Download className="w-4 h-4 mr-2 text-slate-500" />
                <span>Download All</span>
              </button>
            )}
          </div>

          {hasLeases ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70 border-b border-slate-200/80">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Tenant</TableHead>
                    <TableHead className="font-semibold text-slate-700">Lease Period</TableHead>
                    <TableHead className="font-semibold text-slate-700">Annual Rent</TableHead>
                    <TableHead className="font-semibold text-slate-700">Current Month Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {leases.map((lease) => (
                    <TableRow key={lease.id} className="h-20 hover:bg-slate-50/60 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                            {lease.tenant.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {lease.tenant.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {lease.tenant.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        <div>
                          {new Date(lease.startDate).toLocaleDateString()} –
                        </div>
                        <div className="text-xs text-slate-500">{new Date(lease.endDate).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 text-sm">
                        ₦{((lease.annualRent ?? (lease as any).rent ?? 0)).toLocaleString()}
                        <span className="text-xs font-normal text-slate-500">/yr</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            getCurrentMonthPaymentStatus(lease.id) === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {getCurrentMonthPaymentStatus(lease.id) === "Paid" && (
                            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          )}
                          {getCurrentMonthPaymentStatus(lease.id)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 font-mono">
                        {lease.tenant.phoneNumber || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() =>
                            downloadAgreement(lease.id, property?.name)
                          }
                          className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/50 py-1.5 px-3 rounded-xl font-medium cursor-pointer text-xs transition-colors shadow-xs"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>Agreement</span>
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
                No active leases or tenants yet for this property.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyTenants;
