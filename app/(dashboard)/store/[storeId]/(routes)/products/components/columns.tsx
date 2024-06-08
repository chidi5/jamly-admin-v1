"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ProductColumn = {
  id: string;
  name: string;
  price: string;
  variants: number;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const variant = row.getValue("variants") as number;
      return (
        <div className="flex flex-col gap-1">
          <div className="w-full">{row.getValue("name")}</div>
          <span
            className={variant === 0 ? "hidden" : "block text-muted-foreground"}
          >
            {row.getValue("variants")}&nbsp;variants
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "variants",
    header: "",
    cell: () => {
      return null;
    },
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
