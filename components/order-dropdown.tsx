"use client";

import { Car, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "./ui/use-toast";

type OrderMenuProps = {
  orderId: string;
  storeId: string;
};

export function OrderMenu({ orderId, storeId }: OrderMenuProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateOrderStatus = async (status: string) => {
    setLoading(true);
    try {
      await axios.patch(`/api/${storeId}/order/${orderId}`, { status });
      toast({ description: `order status updated to ${status}` });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update order status",
      });
      console.error("Failed to update order status", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">More</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Update Progress</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => updateOrderStatus("DISPATCHED")}
          >
            <Car className="mr-2 h-4 w-4" />
            <span>Dispatched</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => updateOrderStatus("DELIVERED")}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Delivered</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
