"use client";

import { CustomModal } from "@/components/modals/custom-modal";
import { buttonVariants } from "@/components/ui/button";
import { paymentOptions } from "@/lib/constant";
import { getPaymentConfig } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useModal } from "@/providers/cutom-modal-provider";
import { PaymentConfig, Store } from "@prisma/client";
import { CheckCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import PaymentConnectForm from "../components/payment-connect-form";

type StoreWithPaymentConfigs = Store & {
  paymentConfigs: PaymentConfig[];
};

type PaymentFormProps = {
  store: StoreWithPaymentConfigs;
};

const PaymentForm = ({ store }: PaymentFormProps) => {
  const { setOpen } = useModal();
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);

  useEffect(() => {
    const fetchPaymentConfigs = async () => {
      const response = await getPaymentConfig(store.id);
      setPaymentConfigs(response);
    };

    fetchPaymentConfigs();
  }, [store.id]);

  function getPaymentOptionsForCountry(store: Store, paymentOptions: any) {
    const country = store.country!;
    for (const option of paymentOptions) {
      if (option[country]) {
        return option[country];
      }
    }
    return [];
  }

  const countryOption: [] = getPaymentOptionsForCountry(store, paymentOptions);

  const handleConnect = async (name: string) => {
    const paymentConfig = paymentConfigs.find(
      (config) => config.provider === name
    );
    setOpen(
      <CustomModal
        title="Connect Payment"
        subheading="Add Gateway details to Connect"
      >
        <PaymentConnectForm
          initialData={paymentConfig}
          provider={name}
          storeId={store.id}
        />
      </CustomModal>
    );
  };

  return (
    <div>
      {countryOption.length > 0 ? (
        <div>
          {countryOption.map(
            (option: {
              name: string;
              src: string;
              description: string;
              href: string;
            }) => {
              const matchingConfig = paymentConfigs.find(
                (config) => config.provider === option.name
              );
              return (
                <div
                  key={option.name}
                  className="flex justify-between items-center w-full border px-8 py-8 rounded-lg gap-2 mb-6"
                >
                  <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                    <div className="h-24 w-24 border rounded-lg relative flex-none">
                      <Image
                        src={option.src}
                        fill
                        className="rounded-md object-contain p-5 bg-background"
                        alt={option.name}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-medium">{option.name}</h2>
                      <p>{option.description}</p>
                    </div>
                  </div>

                  {matchingConfig ? (
                    matchingConfig.isActive ? (
                      <div className="flex space-x-3">
                        <Link
                          className={cn(buttonVariants({ variant: "outline" }))}
                          onClick={() => handleConnect(option.name)}
                          href={""}
                        >
                          Update
                        </Link>

                        <CheckCircleIcon
                          key={matchingConfig.id}
                          size={30}
                          className="text-primary p-2 flex-shrink-0"
                        />
                      </div>
                    ) : (
                      <div key={matchingConfig.id}>
                        <Link
                          className={cn(buttonVariants({ variant: "outline" }))}
                          onClick={() => handleConnect(option.name)}
                          href={""}
                        >
                          Activate
                        </Link>
                      </div>
                    )
                  ) : (
                    <Link
                      className={cn(buttonVariants({ variant: "outline" }))}
                      onClick={() => handleConnect(option.name)}
                      href={""}
                    >
                      Connect
                    </Link>
                  )}
                </div>
              );
            }
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center w-full border px-8 py-8 rounded-lg gap-2 mb-6">
          <div className="flex md:items-center gap-4 flex-col md:!flex-row">
            <div className="h-24 w-24 border rounded-lg relative flex-none">
              <Image
                src="/stripe.png"
                fill
                className="rounded-md object-contain p-4 bg-background"
                alt="stripe"
              />
            </div>
            <div>
              <h2 className="text-xl font-medium">Stripe</h2>
              <p>Accept Debit/Credit card from your customers</p>
            </div>
          </div>

          {paymentConfigs.length > 0 ? (
            paymentConfigs.map((gateway) =>
              gateway.provider === "Stripe" && gateway.isActive ? (
                <CheckCircleIcon
                  key={gateway.id}
                  size={30}
                  className="text-primary p-2 flex-shrink-0"
                />
              ) : (
                <div key={gateway.id}>
                  <Link
                    className={cn(buttonVariants({ variant: "outline" }))}
                    onClick={() => handleConnect("Stripe")}
                    href={""}
                  >
                    Activate
                  </Link>
                </div>
              )
            )
          ) : (
            <Link
              className={cn(buttonVariants({ variant: "outline" }))}
              onClick={() => handleConnect("Stripe")}
              href={""}
            >
              Connect
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
