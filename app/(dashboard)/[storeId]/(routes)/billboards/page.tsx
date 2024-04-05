import React from "react";
import BillboardClient from "./components/client";
import prismadb from "@/lib/prismadb";

type BillboardProps = {
  params: { storeId: string };
};

const BillboardPage = async ({ params }: BillboardProps) => {
  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient />
      </div>
    </div>
  );
};

export default BillboardPage;
