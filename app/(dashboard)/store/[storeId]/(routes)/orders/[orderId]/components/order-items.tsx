import { Card, CardContent } from "@/components/ui/card";
import { OrderDetailColumn } from "./columns";
import Image from "next/image";

type OrderItemProps = {
  data: OrderDetailColumn[];
};

export const OrderItems = ({ data }: OrderItemProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item) => (
        <Card key={item.product} className="shadow-none">
          <CardContent className="p-2 pt-2">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 relative flex-none">
                <Image
                  src={item.image}
                  fill
                  className="rounded-md object-cover"
                  alt="product image"
                />
              </div>
              <div className="flex flex-col items-start text-sm">
                <strong>{item.product}</strong>
                <div>{renderSelectedOptions(item.selectedOptions)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const renderSelectedOptions = (selectedOptions: string) => {
  try {
    const options = JSON.parse(selectedOptions);
    return (
      <div>
        {Object.entries(options).map(([key, value]) => (
          <div key={key} className="text-muted-foreground font-medium">
            {key}:<strong className="text-foreground"> {String(value)}</strong>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return <div></div>;
  }
};
