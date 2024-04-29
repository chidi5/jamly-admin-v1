"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from "next/navigation";
import { Store } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";

type LaunchPadClientProps = {
  data: Store;
};

const LaunchPadClient = ({ data }: LaunchPadClientProps) => {
  const params = useParams();
  const router = useRouter();

  let connectedStripeAccount = false;

  if (!data) return;

  const allDetailsExist =
    data.address &&
    data.address &&
    data.storeLogo &&
    data.city &&
    data.companyEmail &&
    data.companyPhone &&
    data.country &&
    data.name &&
    data.state &&
    data.zipCode;

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
              <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
                <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                  <Image
                    src="/appstore.png"
                    alt="app logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain"
                  />
                  <p> Save the website as a shortcut on your mobile device</p>
                </div>
                <Button>Start</Button>
              </div>
              <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
                <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                  <Image
                    src="/paystacklogo.png"
                    alt="app logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain"
                  />
                  <p>
                    Connect your paystack account to accept payments and see
                    your dashboard.
                  </p>
                </div>
                {data.connectAccountId || connectedStripeAccount ? (
                  <CheckCircleIcon
                    size={50}
                    className=" text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white"
                    href={"#"}
                  >
                    Start
                  </Link>
                )}
              </div>
              <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
                <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                  <Image
                    src={data.storeLogo ? data.storeLogo : "/empty.png"}
                    alt="app logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain"
                  />
                  <p> Fill in all your bussiness details</p>
                </div>
                {allDetailsExist ? (
                  <CheckCircleIcon
                    size={50}
                    className="text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white"
                    href={`/store/${data.id}/settings`}
                  >
                    Start
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
