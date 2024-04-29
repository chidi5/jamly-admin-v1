import WidthWrapper from "@/components/WidthWrapper";
import Navigation from "@/components/navigation";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-full">
      <WidthWrapper>
        <Navigation />
        {children}
      </WidthWrapper>
    </main>
  );
};

export default layout;
