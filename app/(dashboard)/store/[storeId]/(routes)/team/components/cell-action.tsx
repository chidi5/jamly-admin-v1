"use client";

import { Copy, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "@/components/ui/use-toast";
import { TeamColumn } from "./columns";
import { deleteTeamUser } from "@/lib/queries/invitation";
import { getStoreOwnerbyStoreId } from "@/lib/queries/user";
import { User } from "@prisma/client";

interface CellActionProps {
  data: TeamColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState<User>();
  const [loading, startTransition] = useTransition();

  const storeId = Array.isArray(params.storeId)
    ? params.storeId[0]
    : params.storeId;

  useEffect(() => {
    const fetchOwner = async () => {
      const user = await getStoreOwnerbyStoreId(storeId);
      if (user) {
        setOwner(user);
      }
    };

    if (storeId) {
      fetchOwner();
    }
  }, [storeId]);

  const onConfirm = async () => {
    startTransition(async () => {
      const response = await deleteTeamUser(data.id, storeId);

      if (response.success) {
        toast({ description: response.success });
        router.refresh();
      }
      if (response.error) {
        toast({
          variant: "destructive",
          description: response.error,
        });
      }
      setOpen(false);
    });
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ description: "User Email copied to clipboard." });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.email!)}>
            <Copy className="mr-2 h-4 w-4" /> Copy Email
          </DropdownMenuItem>
          {owner?.role === "STORE_OWNER" && data.role !== "STORE_OWNER" && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
