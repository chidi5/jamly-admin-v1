import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { pricingCards } from "@/lib/constant";
import { getPlans } from "@/lib/paystack/action";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import React from "react";

const PricingPage = async () => {
  const { data } = await getPlans();
  return (
    <MaxWidthWrapper className="mt-36">
      <div className="flex flex-col gap-7 justify-center items-center">
        <div className="rounded-full border bg-white text-sm px-3 py-1">
          Pricing
        </div>
        <div className="items-center text-center space-y-2">
          <h3 className="font-semibold text-3xl">
            Find a solution that fits your need
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20">
        <Card
          className={cn(
            "w-full flex flex-col justify-between rounded-2xl shadow-md"
          )}
        >
          <CardHeader>
            <CardTitle
              className={cn({
                "text-slate-700": true,
              })}
            >
              {pricingCards[0].title}
            </CardTitle>
            <CardDescription className="text-lg">
              {pricingCards[0].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-5">
            <span className="text-4xl font-bold">NGN 0</span>
            <span>/ month</span>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 mt-4 ">
            <div>
              {pricingCards
                .find((c) => c.title === "Starter")
                ?.features.map((feature) => (
                  <div key={feature} className="flex gap-2">
                    <Check />
                    <p className="text-xl last:mb-0 pb-3">{feature}</p>
                  </div>
                ))}
            </div>
            <div className="w-full min-h-[120px] flex items-end mt-auto mb-4">
              <Link
                href="/store"
                className={buttonVariants({
                  size: "lg",
                  className: cn(
                    "w-full text-center bg-primary p-2 rounded-md !text-base",
                    {
                      "!bg-slate-700 hover:!bg-slate-600": true,
                    }
                  ),
                })}
              >
                Get Started
              </Link>
            </div>
          </CardFooter>
        </Card>
        {/*@ts-ignore*/}
        {data?.map((card) => (
          //WIP: Wire up free product from stripe
          <Card
            key={card.id}
            className={cn(
              "w-full flex flex-col justify-between rounded-2xl shadow-md",
              {
                "border-2 border-primary": card.name === "Jamly Unlimited",
              }
            )}
          >
            <CardHeader>
              <CardTitle
                className={cn("", {
                  "text-slate-700": card.name !== "Jamly Unlimited",
                })}
              >
                {card.name}
              </CardTitle>
              <CardDescription className="text-lg">
                {pricingCards.find((p) => p.title === card.name)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-5">
              <span className="text-4xl font-bold">
                NGN {card.amount ? card.amount / 100 : "0"}
              </span>
              <span className="text-muted-foreground">
                <span>/ month</span>
              </span>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 mt-4">
              <div>
                {pricingCards
                  .find((c) => c.title === card.name)
                  ?.features.map((feature) => (
                    <div key={feature} className="flex gap-2">
                      <Check />
                      <p className="text-xl last:mb-0 pb-3">{feature}</p>
                    </div>
                  ))}
              </div>
              <div className="w-full min-h-[120px] flex items-end mt-auto mb-4">
                <Link
                  href={`/store?plan=${card.plan_code}`}
                  className={buttonVariants({
                    size: "lg",
                    className: cn(
                      "w-full text-center p-2 rounded-md !text-base",
                      {
                        "!bg-slate-700 hover:!bg-slate-600":
                          card.name !== "Jamly Unlimited",
                      }
                    ),
                  })}
                >
                  Get Started
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </MaxWidthWrapper>
  );
};

export default PricingPage;
