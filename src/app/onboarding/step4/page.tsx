"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { useOnboarding } from "@/contexts/onboarding-context";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { MessageSquare } from "lucide-react";

const steps = [
  { id: 1, title: "Details", description: "Basic information" },
  { id: 2, title: "Subdomain", description: "Choose your subdomain" },
  { id: 3, title: "Domains", description: "Email domain setup" },
  { id: 4, title: "Profile", description: "Welcome message" },
  { id: 5, title: "Review", description: "Confirm and create" },
];

export default function OnboardingStep4() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customMessage: data.customMessage
    }
  });

  const onSubmit = (formData: any) => {
    setLoading(true);

    // Update onboarding context
    updateData({
      customMessage: formData.customMessage || '',
      currentStep: 5
    });

    setTimeout(() => {
      setLoading(false);
      toast.success("Profile data saved!");
      router.push("/onboarding/step5");
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
        <ProgressIndicator currentStep={4} steps={steps} />

        <div className="glass-card p-8 rounded-3xl">
          <div className="text-center mb-8">
            <Badge variant="outline" className="glass-pill mb-4">
              Step 4: Welcome Message
            </Badge>
            <h1 className="text-3xl font-bold flex items-center justify-center">
              <MessageSquare className="h-8 w-8 mr-3 text-primary" />
              Set your welcome message
            </h1>
            <p className="text-muted-foreground">
              Create a custom welcome message for your support portal.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Custom Message */}
            <div>
              <label htmlFor="customMessage" className="block text-sm font-medium mb-2">
                Welcome Message (Optional)
              </label>
              <textarea
                id="customMessage"
                placeholder="Welcome to our support portal! We're here to help you with any questions or issues you may have."
                className="w-full p-3 glass rounded-xl min-h-[120px]"
                {...register("customMessage")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be displayed to customers when they visit your support portal. You can always change this later.
              </p>
            </div>
            
            {/* Logo Note */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                📸 Organization Logo
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You can upload your organization logo after creation from the organization profile page.
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/onboarding/step3")}
                className="flex-1 glass-pill"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Saving..." : "Save and Continue"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

