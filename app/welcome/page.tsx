"use client";

import { useStoreModal } from "@/hooks/use-store-modal";
import { verifyAndAcceptInvitation } from "@/lib/queries";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);
  return null;
}
