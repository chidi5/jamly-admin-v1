import prismadb from "@/lib/prismadb";
import React from "react";
import OrderDetail from "./components/order-details";

const OrderDeatilPage = async ({
  params,
}: {
  params: { storeId: string; orderId: string };
}) => {
  const order = await prismadb.order.findUnique({
    where: {
      id: params.orderId,
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              priceData: true,
              images: true,
              variants: {
                include: {
                  priceData: true,
                },
              },
            },
          },
        },
      },
      customer: true,
    },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderDetail initialData={order} storeId={params.storeId} />
      </div>
    </div>
  );
};

export default OrderDeatilPage;
