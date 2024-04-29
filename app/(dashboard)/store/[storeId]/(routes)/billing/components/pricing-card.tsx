"use client";

//import CustomModal from "@/components/modals/custom-modal";
import { CustomModal } from "@/components/modals/custom-modal";
import SubscriptionFormWrapper from "@/components/subscription/subscription-form-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useModal } from "@/providers/cutom-modal-provider";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

type PricingCardProps = {
  features: string[];
  buttonCta: string;
  title: string;
  description: string;
  amt: string;
  duration: string;
  highlightTitle: string;
  highlightDescription: string;
  customerId: string;
  plans: any;
  planExists: boolean;
};

const PricingCard = ({
  amt,
  buttonCta,
  customerId,
  description,
  duration,
  features,
  highlightDescription,
  highlightTitle,
  planExists,
  plans,
  title,
}: PricingCardProps) => {
  const { setOpen } = useModal();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const handleManagePlan = async () => {
    setOpen(
      <CustomModal
        title={"Manage Your Plan"}
        subheading="You can change your plan at any time from the billings settings"
      >
        <SubscriptionFormWrapper
          customerId={customerId}
          planExists={planExists}
        />
      </CustomModal>,
      async () => ({
        plans: {
          defaultPlanId: plan ? plan : "",
          plans: plans,
        },
      })
    );
  };

  return (
    <Card className="flex flex-col justify-between lg:w-1/2">
      <div>
        <CardHeader className="flex flex-col md:!flex-row justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <p className="text-6xl font-bold">
            {amt}
            <small className="text-xs font-light text-muted-foreground">
              {duration}
            </small>
          </p>
        </CardHeader>
        <CardContent>
          <ul>
            {features.map((feature) => (
              <li
                key={feature}
                className="list-disc ml-4 text-muted-foreground"
              >
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
      <CardFooter>
        <Card className="w-full">
          <div className="flex flex-col md:!flex-row items-center justify-between rounded-lg border gap-4 p-4">
            <div>
              <p>{highlightTitle}</p>
              <p className="text-sm text-muted-foreground">
                {highlightDescription}
              </p>
            </div>

            <Button className="md:w-fit w-full" onClick={handleManagePlan}>
              {buttonCta}
            </Button>
          </div>
        </Card>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
