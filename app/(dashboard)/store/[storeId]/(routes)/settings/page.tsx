import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import SettingsForm from "./components/settings-form";

type SettingsProps = {
  params: { storeId: string };
};

const SettingsPage = async ({ params }: SettingsProps) => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  });

  if (!store) redirect("/store");

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <SettingsForm initialData={store} />
      </div>
    </div>
  );
};

export default SettingsPage;