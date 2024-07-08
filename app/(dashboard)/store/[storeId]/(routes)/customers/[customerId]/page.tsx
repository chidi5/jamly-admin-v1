import prismadb from "@/lib/prismadb";
import React from "react";
import CustomerDetail from "./components/customer-details";

const CustomerPage = async ({
  params,
}: {
  params: { storeId: string; customerId: string };
}) => {
  const customer = await prismadb.customer.findUnique({
    where: {
      id: params.customerId,
    },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <CustomerDetail initialData={customer} storeId={params.storeId} />
      </div>
    </div>
  );
};

export default CustomerPage;
