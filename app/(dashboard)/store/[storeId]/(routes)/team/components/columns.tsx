"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Role } from "@prisma/client";
import Image from "next/image";

export type TeamColumn = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
};

export const columns: ColumnDef<TeamColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const avatarUrl = row.getValue("avatarUrl") as string;
      return (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 relative flex-none">
            <Image
              src={avatarUrl}
              fill
              className="rounded-full object-cover"
              alt="avatar image"
            />
          </div>
          <span>{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "avatarUrl",
    header: "",
    cell: () => {
      return null;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role: Role = row.getValue("role");
      return (
        <Badge
          className={cn({
            "bg-emerald-500": role === "STORE_OWNER",
            "bg-primary": role === "STAFF_USER",
          })}
        >
          {role}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
