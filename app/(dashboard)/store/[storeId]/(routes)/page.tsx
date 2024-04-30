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
          window.open(
            `http://${params.storeId}.${process.env.NEXT_PUBLIC_SUBDOMAIN}`,
            "_blank"
          )
        }
        className=" ml-auto"
      >
        Storefront <ArrowRight />
      </Button>
    </div>
  );
};

export default DashboardPage;
