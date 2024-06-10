import { buttonVariants } from "@/components/ui/button";
import { paymentOptions } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { Store } from "@prisma/client";
import { CheckCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type PaymentFormProps = {
  store: Store;
};

const PaymentForm = ({ store }: PaymentFormProps) => {
  function getPaymentOptionsForCountry(store: Store, paymentOptions: any) {
    const country = store.country!;
    for (const option of paymentOptions) {
      if (option[country]) {
        return option[country];
      }
    }
    return [];
  }
  const countryOption = getPaymentOptionsForCountry(store, paymentOptions);
  return (
    <div>
      {countryOption.map(
        (option: {
          name: string;
          src: string;
          description: string;
          href: string;
        }) => (
          <div
            key={option.name}
            className="flex justify-between items-center w-full border px-8 py-8 rounded-lg gap-2 mb-6"
          >
            <div className="flex md:items-center gap-4 flex-col md:!flex-row">
              <div className="h-24 w-24 border rounded-lg relative flex-none">
                <Image
                  src={option.src}
                  fill
                  className="rounded-md object-cover p-6 bg-background"
                  alt={option.name}
                />
              </div>
              <div>
                <h2 className="text-xl font-medium">{option.name}</h2>
                <p>{option.description}</p>
              </div>
            </div>

            {store.connectAccountId ? (
              <CheckCircleIcon
                size={30}
                className=" text-primary p-2 flex-shrink-0"
              />
            ) : (
              <Link
                className={cn(buttonVariants({ variant: "outline" }))}
                href={option.href}
              >
                Connect
              </Link>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default PaymentForm;
