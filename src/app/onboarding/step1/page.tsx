"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { useOnboarding } from "@/contexts/onboarding-context";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

const steps = [
  { id: 1, title: "Details", description: "Basic information" },
  { id: 2, title: "Subdomain", description: "Choose your subdomain" },
  { id: 3, title: "Domains", description: "Email domain setup" },
  { id: 4, title: "Profile", description: "Branding and preferences" },
  { id: 5, title: "Review", description: "Confirm and create" },
];

export default function OnboardingStep1() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      orgName: data.organizationName,
      orgDescription: data.organizationDescription
    }
  });

  // Update form values when data changes
  useEffect(() => {
    setValue('orgName', data.organizationName);
    setValue('orgDescription', data.organizationDescription);
  }, [data, setValue]);

  const onSubmit = async (formData: any) => {
    setLoading(true);

    // Update onboarding context
    updateData({
      organizationName: formData.orgName,
      organizationDescription: formData.orgDescription,
      currentStep: 2
    });

    setTimeout(() => {
      setLoading(false);
      toast.success("Organization details saved!");
      router.push("/onboarding/step2");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={1} steps={steps} />

        {/* Form */}
        <div className="glass-card p-8 rounded-3xl">
          <div className="text-center mb-8">
            <Badge variant="outline" className="glass-pill mb-4">
              Step 1: Organization Details
            </Badge>
            <h1 className="text-3xl font-bold">Enter your organization's basic information</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium">
                Organization Name
              </label>
              <input
                id="orgName"
                type="text"
                placeholder="Your Organization Name"
                className="w-full p-3 glass rounded-xl mt-1"
                {...register("orgName", { required: "Organization name is required" })}
              />
              {errors.orgName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.orgName.message as string}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="orgDescription" className="block text-sm font-medium">
                Brief Description
              </label>
              <textarea
                id="orgDescription"
                placeholder="A quick summary of what your organization does"
                className="w-full p-3 glass rounded-xl mt-1"
                {...register("orgDescription")}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Saving..." : "Save and Continue"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
