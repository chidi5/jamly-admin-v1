import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShippingInfo } from "./order-details";

type ShippingCardProps = {
  shipping: ShippingInfo;
  label: string;
};
export const ShippingCard = ({ shipping, label }: ShippingCardProps) => {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="uppercase text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-y-3 w-full mt-4 text-muted-foreground font-semibold">
          {shipping.address}
        </div>
      </CardContent>
    </Card>
  );
};
