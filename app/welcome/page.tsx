"use client";

import { useStoreModal } from "@/hooks/use-store-modal";
import { verifyAndAcceptInvitation } from "@/lib/queries";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: { plan: Plan };
}) {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  const storeId = await verifyAndAcceptInvitation();

  if (storeId) {
    if (searchParams.plan) {
      redirect(`/store?plan=${searchParams.plan}`);
    } else {
      redirect("/store");
    }
  }

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);
  return null;
}
