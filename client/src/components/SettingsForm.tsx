import { SettingsFormData, settingsSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "./ui/form";
import { CustomFormField } from "./FormField";
import { Button } from "./ui/button";
import { Check, Edit3, Lock, Shield, User } from "lucide-react";
import Header from "./Header";

interface SettingsFormProps {
  initialData: SettingsFormData;
  onSubmit: (data: SettingsFormData) => Promise<void>;
  userType: "tenant" | "manager";
}

const SettingsForm = ({
  initialData,
  onSubmit,
  userType,
}: SettingsFormProps) => {
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const toggleEditMode = () => {
    if (editMode) {
      form.reset(initialData);
    }
    setEditMode(!editMode);
  };

  const handleSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      setEditMode(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleTitle = userType === "manager" ? "Property Manager" : "Student Tenant";

  return (
    <div className="dashboard-container space-y-6">
      <Header
        title={`${roleTitle} Profile Settings`}
        subtitle="Manage your personal contact information, verified identity, and notification preferences"
      />

      <div className="bg-card rounded-2xl border border-border shadow-xs p-6 sm:p-8 max-w-3xl">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Account Information</h3>
              <p className="text-xs text-muted-foreground">
                {editMode
                  ? "Make changes below and click save."
                  : "Profile details are verified for secure booking."}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              editMode
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {editMode ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-primary" />
                <span>Editing Mode</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Locked</span>
              </>
            )}
          </span>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <CustomFormField
              name="name"
              label="Full Name"
              placeholder="e.g. Richard Princewill"
              disabled={!editMode}
            />
            <CustomFormField
              name="email"
              label="Email Address"
              type="email"
              placeholder="e.g. user@example.com"
              disabled={!editMode}
            />
            <CustomFormField
              name="phoneNumber"
              label="Phone Number"
              placeholder="e.g. 08012345678"
              disabled={!editMode}
            />

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={toggleEditMode}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 cursor-pointer"
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </Button>

              {editMode && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>

      <div className="bg-muted/50 border border-border rounded-2xl p-6 max-w-3xl flex items-start gap-4">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Account Security: </span>
          Your verified name and contact information are used to validate your identity on reservations and payments under KalRent Cover.
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;
