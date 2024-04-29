"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingCards } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useModal } from "@/providers/cutom-modal-provider";
import { Plan } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SubscriptionForm from ".";
import { Loader } from "../ui/loader";
import axios from "axios";
import { toast } from "../ui/use-toast";

type Props = {
  customerId: string;
  planExists: boolean;
};

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal();
  const router = useRouter();
  const [state, setState] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const [selectedPlanId, setSelectedPlanId] = useState<Plan | "">(
    data?.plans?.defaultPlanId || ""
  );
  const [subscription, setSubscription] = useState<{
    subscriptionId: string;
  }>({ subscriptionId: "" });

  useEffect(() => {
    if (!selectedPlanId) return;
    const timer = setTimeout(() => {
      setState(true);
    }, 1000); // Change state after 10 seconds

    const createSecret = async () => {
      try {
        const subscriptionResponse: string = await axios.post(
          "/api/paystack/create-subscription",
          {
            customerId,
            plan: selectedPlanId,
          }
        );
        setSubscription({ subscriptionId: subscriptionResponse });
        setClose();
        toast({
          title: "Success",
          description: "Your plan has been successfully upgraded!",
        });
        router.refresh();
      } catch (error) {
        toast({
          title: "Ooh Something went wrong",
          description: "Something went wrong",
        });
        console.error("Error: ", error);
      }
    };
    if (selectedPlanId && planExists) {
      createSecret();
    }
    return () => clearTimeout(timer);
  }, [data, selectedPlanId, customerId, planExists]);

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.plans.map((plan) => (
          <Card
            onClick={() => {
              setSelectedPlanId(plan.plan_code as Plan);
              setPrice(plan.amount);
            }}
            key={plan.id}
            className={cn("relative cursor-pointer transition-all", {
              "border-primary": selectedPlanId === plan.plan_code,
            })}
          >
            <CardHeader>
              <CardTitle>
                NGN {plan.amount ? plan.amount / 100 : "0"}
                <p className="text-sm text-muted-foreground font-normal">
                  {plan.name}
                </p>
                <p className="text-sm text-muted-foreground font-normal">
                  {
                    pricingCards.find((p) => p.priceId === plan.plan_code)
                      ?.description
                  }
                </p>
              </CardTitle>
            </CardHeader>
            {selectedPlanId === plan.plan_code && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {state && !planExists && (
          <>
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              Payment Method
            </h2>
            <SubscriptionForm
              selectedPlanId={selectedPlanId}
              price={price}
              customerId={customerId}
              planExists={planExists}
            />
          </>
        )}

        {!state && selectedPlanId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFormWrapper;
