"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import Spinner from "@/components/Spinner";

export type DomainColumn = {
  id: string;
  domain: string;
  status: string;
};

export const columns = (
  fetchDomains: () => void
): ColumnDef<DomainColumn>[] => [
  {
    accessorKey: "domain",
    header: "Domain",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center gap-2">
          <div className="relative flex-none font-medium uppercase">
            {status}
          </div>
          {status === "pending" && (
            <div className="flex flex-col items-start">
              <Spinner />
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellAction data={row.original} fetchDomains={fetchDomains} />
    ),
  },
];
