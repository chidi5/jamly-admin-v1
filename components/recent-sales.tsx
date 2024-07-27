import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type RecentSalesProps = {
  data: {
    productName: string;
    productImage: string;
    totalAmountPaid: number;
    quantity: number;
  }[];
};

const RecentSales = ({ data }: RecentSalesProps) => {
  return (
    <>
      {data.map((item) => (
        <div key={item.productName} className="flex items-center gap-4">
          <Avatar className="hidden h-9 w-9 sm:flex">
            <AvatarImage
              src={item.productImage}
              alt="product image"
              className="rounded-md"
            />
            <AvatarFallback>OM</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">
              {item.productName}
            </p>
            <p className="text-sm text-muted-foreground">
              quantity: {item.quantity}
            </p>
          </div>
          <div className="ml-auto font-medium">{item.totalAmountPaid}</div>
        </div>
      ))}
    </>
  );
};

export default RecentSales;
