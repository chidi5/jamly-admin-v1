"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export const Social = () => {
  return (
    <div className="grid grid-cols-2 w-full gap-2">
      <Button
        size="lg"
        variant="outline"
        className="w-full text-muted-foreground text-ellipsis"
      >
        <FcGoogle className="w-5 h-5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-full text-muted-foreground"
      >
        <FaGithub className="w-5 h-5" />
      </Button>
    </div>
  );
};
