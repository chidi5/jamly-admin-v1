"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export type OrderDetailColumn = {
  product: string;
  image: string;
  quantity: number;
  price: string;
  total: number;
  selectedOptions: string;
};

export const columns: ColumnDef<OrderDetailColumn>[] = [
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      const image = row.getValue("image") as string;
      return (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 relative flex-none">
            <Image
              src={image}
              fill
              className="rounded-md object-cover"
              alt="product image"
            />
          </div>
          <div className="flex flex-col items-start">
            <strong>{row.getValue("product")}</strong>
            <span>
              {renderSelectedOptions(row.getValue("selectedOptions"))}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "image",
    header: "",
    cell: () => {
      return null;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const actualPrice = row.getValue("total") as number;
      const quantity = row.getValue("quantity") as number;
      const total = actualPrice * quantity;
      return total.toFixed(2);
    },
  },
  {
    accessorKey: "selectedOptions",
    header: "",
    cell: () => {
      return null;
    },
  },
];

const renderSelectedOptions = (selectedOptions: string) => {
  try {
    const options = JSON.parse(selectedOptions);
    return (
      <div>
        {Object.entries(options).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {String(value)}
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return <div></div>;
  }
};
