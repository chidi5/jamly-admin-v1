import {
  Customer,
  Image,
  Order,
  OrderItem,
  PriceData,
  Product,
  Variant,
} from "@prisma/client";
import React from "react";
import { format } from "date-fns";
import { OrderInfoCard } from "./order-info-card";
import { CustomerCard } from "./customer-card";
import { ShippingCard } from "./shipping-card";
import OrderDetailClient from "./client";
import { priceFormatter } from "@/lib/queries";
import { getAuthUserDetails } from "@/lib/queries/user";
import { OrderDetailColumn } from "./columns";
import { OrderItems } from "./order-items";

type OrderDetailsProps = {
  initialData:
    | (Order & {
        customer: Customer | null;
        orderItems: (OrderItem & {
          product: Product & {
            priceData: PriceData | null;
            images: Image[];
            variants: (Variant & {
              priceData: PriceData | null;
            })[];
          };
        })[];
      })
    | null;
  storeId: string;
};

export type OrderInfo = {
  id: string;
  order: string;
  status: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
};

export type ShippingInfo = {
  address: string;
};

const OrderDetail = async ({ initialData, storeId }: OrderDetailsProps) => {
  if (!initialData) {
    return <div>No order data available</div>;
  }

  const user = await getAuthUserDetails();

  if (!user) return null;

  const selectedStore = user.stores.find((store) => store.id === storeId);
  if (!selectedStore) return null;

  const formatter = await priceFormatter(
    selectedStore.locale,
    selectedStore.defaultCurrency
  );

  const orderInfo: OrderInfo = {
    id: initialData.id,
    order: initialData.orderNumber,
    status: initialData.status,
    isPaid: initialData.isPaid,
    createdAt: format(initialData.createdAt, "MMMM do, yyyy"),
    updatedAt: format(initialData.updatedAt, "MMMM do, yyyy"),
  };

  const customerDetails: CustomerInfo = {
    name: initialData.customer?.firstName
      ? `${initialData.customer?.firstName} ${initialData.customer?.lastName}`
      : "-",
    email: initialData.customer?.email || initialData.guest || "-",
    phone: initialData.phone,
  };

  const shippingDetails: ShippingInfo = {
    address: initialData.address,
  };

  const formattedData: OrderDetailColumn[] = initialData
    ? initialData.orderItems.map((orderItem) => ({
        product: orderItem.product.name,
        image: orderItem.product.images[0].url,
        quantity: orderItem.quantity!,
        price: formatter.format(Number(orderItem.price)),
        total: Number(orderItem.price),
        selectedOptions: JSON.stringify(orderItem.selectedOptions),
      }))
    : [];

  const totalSum = formattedData.reduce(
    (sum, item) => sum + item.total * item.quantity,
    0
  );
  const formattedTotal = formatter.format(totalSum);

  return (
    <div>
      <div className="w-full space-y-10">
        <OrderInfoCard info={orderInfo} storeId={storeId} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <CustomerCard customer={customerDetails} />
          <ShippingCard shipping={shippingDetails} label="Shipping Details" />
          <ShippingCard shipping={shippingDetails} label="Billing Details" />
        </div>
        <OrderItems data={formattedData} />
        <OrderDetailClient data={formattedData} total={formattedTotal} />
      </div>
    </div>
  );
};

export default OrderDetail;
