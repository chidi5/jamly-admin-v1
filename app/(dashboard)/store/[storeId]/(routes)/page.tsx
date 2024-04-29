"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";

const DashboardPage = ({ params }: { params: { storeId: string } }) => {
  return (
    <div className="flex">
      <h3>DashboardPage</h3>
      <Button
        onClick={() =>
          window.location.replace(`${params.storeId}.localhost:3001`)
        }
        className=" ml-auto"
      >
        Storefront <ArrowRight />
      </Button>
    </div>
  );
};

export default DashboardPage;
