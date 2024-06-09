"use client";

import React from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const StoreFrontButton = ({ storeId }: { storeId: string }) => {
  return (
    <Button
      onClick={() =>
        window.open(
          `http://${storeId}.${process.env.NEXT_PUBLIC_SUBDOMAIN}`,
          "_blank"
        )
      }
      className="ml-auto group"
    >
      Storefront&nbsp;
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
};

export default StoreFrontButton;
