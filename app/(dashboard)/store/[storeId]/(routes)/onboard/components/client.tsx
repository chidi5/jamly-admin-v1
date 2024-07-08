"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PaymentConfig, Store } from "@prisma/client";
import { CheckCircleIcon, Dot } from "lucide-react";
import Link from "next/link";

type StoreWithPaymentConfigs = Store & {
  paymentConfigs: PaymentConfig[];
};

type LaunchPadClientProps = {
  store: StoreWithPaymentConfigs;
  product: number;
};

const LaunchPadClient = ({ store, product }: LaunchPadClientProps) => {
  const allDetailsExist =
    store.address &&
    store.address &&
    store.storeLogo &&
    store.city &&
    store.companyEmail &&
    store.companyPhone &&
    store.country &&
    store.name &&
    store.state &&
    store.zipCode;

  return (
    <>
      <Heading
        title="Launch pad"
        description="Manage payment and get your store going"
      />
      <Separator />
      <div className="flex flex-col justify-center items-center">
        <div className="w-full h-full max-w-[800px]">
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle>Lets get started!</CardTitle>
              <CardDescription>
                Follow the steps below to get your account setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between items-center w-full border p-3 rounded-lg gap-2">
                <div className="flex md:items-center gap-4 flex-row">
                  <Dot />
                  <p>Set up payment method</p>
                </div>
                {store.paymentConfigs.length > 0 ? (
                  <CheckCircleIcon
                    size={30}
                    className=" text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className={cn(buttonVariants({ variant: "outline" }))}
                    href="settings/payment"
                  >
                    Set up Payment
                  </Link>
                )}
              </div>
              <div className="flex justify-between items-center w-full border p-3 rounded-lg gap-2 cursor-pointer">
                <div className="flex md:items-center gap-4 flex-row">
                  <Dot />
                  <p> Fill in all your bussiness details</p>
                </div>
                {allDetailsExist ? (
                  <CheckCircleIcon
                    size={30}
                    className="text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className={cn(buttonVariants({ variant: "outline" }))}
                    href={`/store/${store.id}/settings/account`}
                  >
                    Get Started
                  </Link>
                )}
              </div>
              <div className="flex justify-between items-center w-full border p-3 rounded-lg gap-2 cursor-pointer">
                <div className="flex md:items-center gap-4 flex-row">
                  <Dot />
                  <p>Add your first product</p>
                </div>
                {product > 0 ? (
                  <CheckCircleIcon
                    size={30}
                    className="text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className={cn(buttonVariants({ variant: "outline" }))}
                    href={`/store/${store.id}/products/new`}
                  >
                    Add Product
                  </Link>
                )}
              </div>
              <div className="flex justify-between items-center w-full border p-3 rounded-lg gap-2 cursor-pointer">
                <div className="flex md:items-center gap-4 flex-row">
                  <Dot />
                  <p>Add your socials to display on storefront</p>
                </div>
                {product > 0 ? (
                  <CheckCircleIcon
                    size={30}
                    className="text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className={cn(buttonVariants({ variant: "outline" }))}
                    href={`/store/${store.id}/products/new`}
                  >
                    Add Socials
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LaunchPadClient;
