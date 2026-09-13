import { Button } from "@/components/ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { Phone, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const ContactWidget = ({ onOpenModal }: ContactWidgetProps) => {
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();

  const handleButtonClick = () => {
    if (authUser) {
      onOpenModal();
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs h-fit min-w-[300px] space-y-4">
      {/* Trust Guarantee Header */}
      <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-900">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-semibold">BaaS Escrow Protected Booking</span>
      </div>

      {/* Contact Property */}
      <div className="flex items-center gap-4 border border-slate-200 rounded-xl p-3.5 bg-slate-50">
        <div className="flex items-center justify-center w-10 h-10 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
          <Phone className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Direct Student Support
          </span>
          <div className="text-sm font-bold text-slate-900 font-mono">
            +234 808 820 3832
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl h-11 text-xs shadow-xs cursor-pointer transition-all"
        onClick={handleButtonClick}
      >
        {authUser ? "Apply for Tenancy (Instant Escrow)" : "Sign In to Submit Application"}
      </Button>

      <hr className="border-slate-100 my-3" />
      <div className="space-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Languages: English, Yoruba</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Move-in inspection warranty included</span>
        </div>
        <div className="text-[11px] text-slate-400 pt-1">
          Inspection hours: Mon – Sat (9:00 AM – 6:00 PM)
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;
