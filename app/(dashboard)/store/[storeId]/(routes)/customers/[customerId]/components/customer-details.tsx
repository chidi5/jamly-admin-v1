import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Customer } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { CustomerDetailColumn } from "./columns";
import prismadb from "@/lib/prismadb";
import CustomerDetailClient from "./client";
import { getAuthUserDetails } from "@/lib/queries/user";
import { priceFormatter } from "@/lib/queries";

type CustomerDetailProps = {
  initialData: Customer | null;
  storeId: string;
};

const CustomerDetail = async ({
  initialData,
  storeId,
}: CustomerDetailProps) => {
  const customer = await prismadb.customer.findUnique({
    where: { id: initialData!.id },
    include: {
      orders: {
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  priceData: true,
                  variants: {
                    include: {
                      priceData: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const user = await getAuthUserDetails();

  if (!user) return null;

  const selectedStore = user.stores.find((store) => store.id === storeId);
  if (!selectedStore) return null;

  const formatter = await priceFormatter(
    selectedStore.locale,
    selectedStore.defaultCurrency
  );

  const formattedData: CustomerDetailColumn[] = customer
    ? customer.orders.map((order) => ({
        id: order.id,
        order: order.orderItems
          .map((orderItem) => orderItem.product.name)
          .join(", "),
        status: order.status,
        totalAmount: formatter.format(
          order.orderItems.reduce(
            (total, item) => total + item.price.toNumber(),
            0
          )
        ),
        createdAt: format(order.createdAt, "MMMM do, yyyy"),
      }))
    : [];

  const totalOrders = customer ? customer.orders.length : 0;

  return (
    <div className="p-8 pt-6 space-y-6">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">
            <div className="flex initialDatas-center gap-6">
              <div className="h-16 w-16 relative flex-none">
                <Image
                  src="/avatar.png"
                  fill
                  className="rounded-full object-cover"
                  alt="avatar image"
                />
              </div>
              <div className="flex flex-col">
                <span>{`${initialData?.firstName} ${initialData?.lastName}`}</span>
                <p className="text-sm text-muted-foreground">
                  {initialData?.email}
                </p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator />
          <div className="grid grid-cols-3 gap-1 pt-8 px-6">
            <div className="flex flex-col gap-1 w-fit">
              <h3 className="text-muted-foreground text-sm font-medium">
                Phone
              </h3>
              <p className="font-medium mt-2 text-wrap">
                {initialData?.phone ?? "-"}
              </p>
            </div>
            <div className="flex flex-col gap-1 w-fit">
              <h3 className="text-muted-foreground text-sm font-medium">
                Address
              </h3>
              <p className="font-medium mt-2">{initialData?.address ?? "-"}</p>
            </div>
            <div className="flex flex-col gap-1 w-fit">
              <h3 className="text-muted-foreground text-sm font-medium">
                Total order
              </h3>
              <p className="font-medium mt-2">{totalOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <CustomerDetailClient data={formattedData} />
    </div>
  );
};

export default CustomerDetail;
