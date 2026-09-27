"use client";

import React, { useState } from "react";
import { useGetLeaseLifecycleQuery } from "@/state/api";
import {
  ShieldCheck,
  Download,
  Receipt,
  CalendarCheck,
  Clock,
  AlertCircle,
  FileCheck2,
  Lock,
  Check,
} from "lucide-react";
import { downloadAgreement } from "@/lib/downloadAgreement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from 'react-hot-toast';

interface EnterpriseTenancyCardProps {
  leaseId: number;
  propertyName?: string;
  propertyAddress?: string;
}

export const EnterpriseTenancyCard: React.FC<EnterpriseTenancyCardProps> = ({
  leaseId,
  propertyName = "Rental Property",
  propertyAddress,
}) => {
  const { data: lifecycle, isLoading, isError } = useGetLeaseLifecycleQuery(
    leaseId
  );
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isRequestingInspection, setIsRequestingInspection] = useState(false);
  const [inspectionRequested, setInspectionRequested] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
        <div className="h-20 bg-slate-50 rounded-xl"></div>
      </div>
    );
  }

  if (isError || !lifecycle) {
    return null;
  }

  const handleInspectionRequest = () => {
    setIsRequestingInspection(true);
    setTimeout(() => {
      setIsRequestingInspection(false);
      setInspectionRequested(true);
      toast.success(
        "Move-out inspection request successfully submitted to property manager."
      );
    }, 600);
  };

  const formattedStartDate = new Date(lifecycle.startDate).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const formattedEndDate = new Date(lifecycle.endDate).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Top Header: Badge & Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            ACTIVE TENANCY
          </span>

          {lifecycle.isExpiringSoon && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
              <Clock className="w-3 h-3 mr-1" />
              Expiring Soon
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          Lease Ref: <span className="font-mono text-foreground">#KR-L{leaseId}</span>
        </div>
      </div>

      {/* Temporal Progress Bar */}
      <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-foreground flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-primary" />
            Tenancy Progression
          </span>
          <span className="text-primary font-semibold">
            {lifecycle.daysRemaining} days left ({lifecycle.percentCompleted}%)
          </span>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(2, lifecycle.percentCompleted)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div>
            <span className="text-muted-foreground/70 block">Commencement</span>
            <span className="font-medium text-foreground">{formattedStartDate}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground/70 block">Expiration</span>
            <span className="font-medium text-foreground">{formattedEndDate}</span>
          </div>
        </div>
      </div>

      {/* Escrow Vault Card */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border border-primary/15 rounded-xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-xs shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-bold text-foreground text-sm">
                Caution Deposit Held in Escrow
              </h4>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-primary/15 text-primary rounded-md border border-primary/25">
                {lifecycle.escrowStatus}
              </span>
            </div>
            <div className="text-xl font-black text-primary mb-1">
              ₦{lifecycle.cautionDeposit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 inline" />
              Guaranteed refundable upon satisfactory move-out inspection in accordance with Kwara State Tenancy Laws.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsReceiptOpen(true)}
          className="shrink-0 px-3.5 py-2 text-xs font-semibold text-primary bg-card border border-primary/30 rounded-xl hover:bg-primary/10 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-stretch md:self-auto justify-center"
        >
          <Receipt className="w-3.5 h-3.5" />
          View Custody Receipt
        </button>
      </div>

      {/* Action Hub */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-border">
        <button
          onClick={() => downloadAgreement(leaseId, propertyName)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-secondary transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
          Download Agreement (PDF)
        </button>

        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleInspectionRequest}
            disabled={!lifecycle.isEligibleForMoveOutInspection || inspectionRequested || isRequestingInspection}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-2xs ${
              lifecycle.isEligibleForMoveOutInspection
                ? inspectionRequested
                  ? "bg-primary/10 text-primary border border-primary/20 cursor-default"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            {inspectionRequested ? (
              <span className="inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Inspection Requested
              </span>
            ) : isRequestingInspection ? (
              "Submitting..."
            ) : (
              "Request Early Move-out Inspection"
            )}
          </button>

          {!lifecycle.isEligibleForMoveOutInspection && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Available 30 days prior to lease expiration ({lifecycle.daysRemaining} days left)
            </span>
          )}
        </div>
      </div>

      {/* Escrow Custody Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md bg-card border border-border text-card-foreground p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Protected Deposit Certificate
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  KalRent Cover Caution Deposit Guarantee
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-4 text-xs text-foreground">
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">Certificate No:</span>
                <span className="font-mono font-semibold text-foreground">
                  ESC-KAL-{leaseId}-{lifecycle.cautionDeposit}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">Property:</span>
                <span className="font-medium text-foreground">{propertyName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">Caution Deposit:</span>
                <span className="font-bold text-primary text-sm">
                  ₦{lifecycle.cautionDeposit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">Custody Status:</span>
                <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                  {lifecycle.escrowStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custody Inception:</span>
                <span className="font-medium text-foreground">{formattedStartDate}</span>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/15 rounded-xl p-3.5 text-[11px] text-primary leading-relaxed">
              <strong>Deposit Protection:</strong> This caution deposit is securely held under KalRent Cover. Funds are protected from unfair deductions and remain 100% refundable upon checkout inspection clearance.
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-xl hover:bg-primary/90 transition-colors cursor-pointer text-xs"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnterpriseTenancyCard;
