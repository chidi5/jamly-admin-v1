import Navigation from "@/components/navigation";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Jamly",
  description: "Jamly",
};

const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full">
      <Navigation />
      {children}
    </div>
  );
};

export default layout;
