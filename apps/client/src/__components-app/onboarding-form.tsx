"use client";

import AvatarWithCropper from "@/__components-app/avatar-with-croper";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createServiceCLient } from "@/lib/supabase/client";
import { useState } from "react";
import toast from "react-hot-toast";

const OnboardingForm = () => {
  const { user } = useAuth();
  const supabase_service = createServiceCLient();
  const [finalCroppedAvatar, setFinalCroppedAvatar] = useState<Blob | null>(
    null
  );

  const submit = async () => {
    if (!finalCroppedAvatar) return;
    const fileName = `${user?.id}/avatar.jpeg`;
    // Upload the avatar to your server or storage service here
    const { data, error } = await supabase_service.storage
      .from("avatars")
      .upload(fileName, finalCroppedAvatar, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      });
    if (error) {
      console.error("Error uploading avatar:", error);
    } else {
      console.log("Avatar uploaded successfully:", data);
      toast.success("Avatar uploaded successfully!", { duration: 2000 });
    }
  };

  console.log("final cropped avatar blob:", finalCroppedAvatar);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="min-w-md rounded-md border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-800 md:p-10">
        <AvatarWithCropper onCropComplete={setFinalCroppedAvatar} />
        <Button onClick={submit}>submit</Button>
      </div>
    </div>
  );
};

export default OnboardingForm;
