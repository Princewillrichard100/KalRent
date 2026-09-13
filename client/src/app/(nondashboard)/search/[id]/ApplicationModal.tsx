"use client";

import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ApplicationFormData, applicationSchema } from "@/lib/schemas";
import { useCreateApplicationMutation, useGetAuthUserQuery } from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const ApplicationModal = ({
  isOpen,
  onClose,
  propertyId,
}: ApplicationModalProps) => {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const { data: authUser } = useGetAuthUserQuery();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
    },
  });

  useEffect(() => {
    if (authUser?.userInfo) {
      form.reset({
        name: authUser.userInfo.name || "",
        email: (authUser.userInfo as any).email || authUser.cognitoInfo?.email || "",
        phoneNumber: (authUser.userInfo as any).phoneNumber || "",
        message: "",
      });
    }
  }, [authUser, form]);

  const onSubmit = async (data: ApplicationFormData) => {
    if (!authUser || authUser.userRole !== "tenant") {
      toast.error("You must be signed in as a student tenant to apply.");
      return;
    }

    try {
      await createApplication({
        ...data,
        applicationDate: new Date().toISOString(),
        status: "PENDING",
        propertyId: propertyId,
        tenantCognitoId: authUser.cognitoInfo.userId,
      }).unwrap();
      toast.success("Application submitted! The property manager will review your request.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl max-w-md p-6 shadow-xl border border-slate-200">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Apply for Tenancy
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Direct booking backed by BaaS escrow protection
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomFormField
              name="name"
              label="Student Name"
              type="text"
              placeholder="e.g. Richard Princewill"
            />
            <CustomFormField
              name="email"
              label="Student Email Address"
              type="email"
              placeholder="e.g. student@unilorin.edu.ng"
            />
            <CustomFormField
              name="phoneNumber"
              label="Active Phone Number"
              type="text"
              placeholder="e.g. 08088203832"
            />
            <CustomFormField
              name="message"
              label="Introduction or Notes for Manager (Optional)"
              type="textarea"
              placeholder="State your department, level, or planned move-in date..."
            />

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed">
              Upon manager approval, you will receive an invitation to review the tenancy schedule and deposit funds into BaaS escrow.
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl w-full h-11 text-xs shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <span>Submit Rental Application</span>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
