import Navigation from "@/components/navigation";
import { getAuthUserDetails } from "@/lib/queries";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Jamly",
  description: "Jamly",
};

const layout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getAuthUserDetails();

  return (
    <div className="h-full w-full">
      <Navigation user={user} />
      {children}
    </div>
  );
};

export default layout;
