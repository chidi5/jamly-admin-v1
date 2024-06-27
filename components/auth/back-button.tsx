"use client";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

type BackButtonProps = {
  label: string;
  href: string;
};

export const BackButton = ({ label, href }: BackButtonProps) => {
  return (
    <Button
      variant="link"
      size="sm"
      className="text-muted-foreground p-0"
      asChild
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};
