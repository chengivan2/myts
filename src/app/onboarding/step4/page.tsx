"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { useOnboarding } from "@/contexts/onboarding-context";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Upload, Image, X } from "lucide-react";

const steps = [
  { id: 1, title: "Details", description: "Basic information" },
  { id: 2, title: "Subdomain", description: "Choose your subdomain" },
  { id: 3, title: "Domains", description: "Email domain setup" },
  { id: 4, title: "Profile", description: "Branding and preferences" },
  { id: 5, title: "Review", description: "Confirm and create" },
];

export default function OnboardingStep4() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [logo, setLogo] = useState<File | null>(data.logo);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customMessage: data.customMessage
    }
  });

  // Update form values when data changes
  useEffect(() => {
    setValue('customMessage', data.customMessage);
    setLogo(data.logo);
  }, [data, setValue]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      toast.success("Logo uploaded successfully!");
    }
  };

  const removeLogo = () => {
    setLogo(null);
    toast.info("Logo removed");
  };

  const onSubmit = (formData: any) => {
    setLoading(true);

    // Update onboarding context (logo is optional)
    updateData({
      logo: logo,
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
              Step 4: Profile & Branding
            </Badge>
            <h1 className="text-3xl font-bold">
              Customize your organization's profile
            </h1>
            <p className="text-muted-foreground">
              Upload a logo and set branding preferences.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Organization Logo
                </label>
                {logo ? (
                  <div className="flex items-center space-x-4">
                    <img
                      src={URL.createObjectURL(logo)}
                      alt="Logo preview"
                      className="w-24 h-24 object-cover rounded-full"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={removeLogo}
                    >
                      <X className="h-5 w-5" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                    <Upload className="h-8 w-8" />
                    <span className="mt-2 text-base leading-normal">
                      Select a logo file
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleLogoUpload}

                    />
                  </label>
                )}
              </div>

            </div>

            {/* Custom Message */}
            <div>
              <label htmlFor="customMessage" className="block text-sm font-medium mb-2">
                Welcome Message (Optional)
              </label>
              <textarea
                id="customMessage"
                placeholder="Welcome to our support portal! We're here to help you with any questions or issues you may have."
                className="w-full p-3 glass rounded-xl min-h-[100px]"
                {...register("customMessage")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be displayed to customers when they visit your support portal
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

