import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerInfo } from "./order-details";

type CustomerCardProps = {
  customer: CustomerInfo;
};

export const CustomerCard = ({ customer }: CustomerCardProps) => {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="uppercase text-base">Customer & Order</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-3 w-full mt-4">
          <div className="flex items-center justify-between w-full text-muted-foreground font-semibold">
            <h4 className="font-semibold text-foreground">Name</h4>
            <span>{customer.name}</span>
          </div>
          <div className="flex items-center justify-between w-full text-muted-foreground font-semibold">
            <h4 className="font-semibold text-foreground">Email</h4>
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center justify-between w-full text-muted-foreground font-semibold">
            <h4 className="font-semibold text-foreground">Phone</h4>
            <span>{customer.phone}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
