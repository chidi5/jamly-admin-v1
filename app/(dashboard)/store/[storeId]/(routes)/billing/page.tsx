import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { pricingCards } from "@/lib/constant";
import { getCustomer, getPlans } from "@/lib/paystack/action";
import prismadb from "@/lib/prismadb";
import PricingCard from "./components/pricing-card";

type BillingProps = {
  params: { storeId: string };
};

const Billingpage = async ({ params }: BillingProps) => {
  const storeSubscription = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    },
    select: {
      customerId: true,
      Subscription: true,
    },
  });

  const plans = await getPlans();
  const cus = await getCustomer(storeSubscription?.customerId!);

  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === storeSubscription?.Subscription?.priceId
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/*<SubscriptionHelper
          prices={plans.data!}
          customerId={storeSubscription?.customerId || ""}
          planExists={storeSubscription?.Subscription?.active === true}
  />*/}
        <Heading
          title="Billing"
          description="Manage your subscription to Jamly"
        />
        <Separator />
        <h3 className="text-2xl font-semibold leading-none tracking-tight pt-5">
          Current plan
        </h3>
        <div className="flex flex-col lg:!flex-row justify-between gap-8">
          <PricingCard
            planExists={storeSubscription?.Subscription?.active === true}
            plans={plans.data}
            customerId={storeSubscription?.customerId || ""}
            amt={
              storeSubscription?.Subscription?.active === true
                ? currentPlanDetails?.price || "NGN 0"
                : "NGN 0"
            }
            buttonCta={
              storeSubscription?.Subscription?.active === true
                ? "Change Plan"
                : "Get Started"
            }
            highlightDescription="Want to modify your plan? You can do this here. If you have
          further question contact support@jamly-app.com"
            highlightTitle="Plan Options"
            description={
              storeSubscription?.Subscription?.active === true
                ? currentPlanDetails?.description || "Lets get started"
                : "Lets get started! Pick a plan that works best for you."
            }
            duration="/ month"
            features={
              storeSubscription?.Subscription?.active === true
                ? currentPlanDetails?.features || []
                : currentPlanDetails?.features ||
                  pricingCards.find((pricing) => pricing.title === "Starter")
                    ?.features ||
                  []
            }
            title={
              storeSubscription?.Subscription?.active === true
                ? currentPlanDetails?.title || "Starter"
                : "Starter"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Billingpage;
