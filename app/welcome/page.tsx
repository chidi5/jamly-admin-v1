"use client";

import { useStoreModal } from "@/hooks/use-store-modal";
import { verifyAndAcceptInvitation } from "@/lib/queries";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  const storeId = await verifyAndAcceptInvitation();

  if (storeId) {
    redirect(`/store?plan=${searchParams.plan}`);
  }

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);
  return null;
}
