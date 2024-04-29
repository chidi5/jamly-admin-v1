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
import Image from "next/image";
import Link from "next/link";
import React from "react";

const HomePage = async () => {
  const { data } = await getPlans();

  return (
    <>
      <section className="h-full w-full md:pt-44 mt-[-70px] relative flex items-center justify-center flex-col ">
        {/* grid */}

        <div className="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>

        <p className="text-center">Run your store, in one place</p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center md:text-[300px]">
            Jamly
          </h1>
        </div>
        <div className="flex justify-center items-center relative md:mt-[-70px]">
          <Image
            src={"/assets/preview.png"}
            alt="banner image"
            height={1200}
            width={1200}
            className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted"
          />
          <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
      </section>
      <section className="flex justify-center items-center flex-col gap-4 md:!mt-20 mt-[-60px]">
        <h2 className="text-4xl text-center"> Choose what fits you right</h2>
        <p className="text-muted-foreground text-center">
          Our straightforward pricing plans are tailored to meet your needs. If
          {" you're"} not <br />
          ready to commit you can get started for free.
        </p>
        <div className="flex  justify-center gap-4 flex-wrap mt-6">
          <Card className={cn("w-[300px] flex flex-col justify-between")}>
            <CardHeader>
              <CardTitle
                className={cn({
                  "text-muted-foreground": true,
                })}
              >
                {pricingCards[0].title}
              </CardTitle>
              <CardDescription>{pricingCards[0].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-bold">NGN 0</span>
              <span>/ month</span>
            </CardContent>
            <CardFooter className="flex flex-col  items-start gap-4 ">
              <div>
                {pricingCards
                  .find((c) => c.title === "Starter")
                  ?.features.map((feature) => (
                    <div key={feature} className="flex gap-2">
                      <Check />
                      <p>{feature}</p>
                    </div>
                  ))}
              </div>
              <Link
                href="/store"
                className={buttonVariants({
                  className: cn(
                    "w-full text-center bg-primary p-2 rounded-md",
                    {
                      "!bg-muted-foreground": true,
                    }
                  ),
                })}
              >
                Get Started
              </Link>
            </CardFooter>
          </Card>
          {/*@ts-ignore*/}
          {data?.map((card) => (
            //WIP: Wire up free product from stripe
            <Card
              key={card.id}
              className={cn("w-[300px] flex flex-col justify-between", {
                "border-2 border-primary": card.name === "Jamly Unlimited",
              })}
            >
              <CardHeader>
                <CardTitle
                  className={cn("", {
                    "text-muted-foreground": card.name !== "Jamly Unlimited",
                  })}
                >
                  {card.name}
                </CardTitle>
                <CardDescription>
                  {pricingCards.find((p) => p.title === card.name)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-4xl font-bold">
                  NGN {card.amount ? card.amount / 100 : "0"}
                </span>
                <span className="text-muted-foreground">
                  <span>/ {card.duration}</span>
                </span>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div>
                  {pricingCards
                    .find((c) => c.title === card.name)
                    ?.features.map((feature) => (
                      <div key={feature} className="flex gap-2">
                        <Check />
                        <p>{feature}</p>
                      </div>
                    ))}
                </div>
                <Link
                  href={`/store?plan=${card.plan_code}`}
                  className={buttonVariants({
                    className: cn("w-full text-center p-2 rounded-md", {
                      "!bg-muted-foreground": card.name !== "Jamly Unlimited",
                    }),
                  })}
                >
                  Get Started
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
