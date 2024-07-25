import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { OrderInfo } from "./order-details";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { File, Send, Upload } from "lucide-react";
import { OrderMenu } from "@/components/order-dropdown";

type OrderInfoProps = {
  info: OrderInfo;
  storeId: string;
};

export const OrderInfoCard = ({ info, storeId }: OrderInfoProps) => {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <h2>Order #{info.order}</h2>
            <div className="ml-auto flex space-x-4">
              <OrderMenu orderId={info.id} storeId={storeId} />
              <Button>
                <Upload className="w-4 h-4" />
                &nbsp; Export
              </Button>
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          <Badge
            className={cn("rounded-md py-1 text-xs", {
              "bg-yellow-100/80 text-yellow-500": info.status === "PROCESSING",
              "bg-emerald-100/80 text-emerald-500":
                info.status === "DISPATCHED",
              "bg-blue-100/80 text-blue-7500": info.status === "DELIVERED",
            })}
          >
            {info.status}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
            <span className="font-semibold">Paid on:</span>&nbsp;
            <span className="text-muted-foreground">{info.createdAt}</span>
          </div>
          <div className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
            <span className="font-semibold">Placed on:</span>&nbsp;
            <span className="text-muted-foreground">{info.createdAt}</span>
          </div>
          {info.status === "DISPATCHED" && (
            <div className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
              <span className="font-semibold">Dispatched on:</span>&nbsp;
              <span className="text-muted-foreground">{info.updatedAt}</span>
            </div>
          )}
          {info.status === "DELIVERED" && (
            <div className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
              <span className="font-semibold">Delivered on:</span>&nbsp;
              <span className="text-muted-foreground">{info.updatedAt}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
