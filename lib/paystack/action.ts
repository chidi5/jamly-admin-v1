"use server";
import { paystack } from ".";
import prismadb from "../prismadb";

export const subscriptionCreated = async (
  subscription: any,
  customerId: string
) => {
  try {
    const store = await prismadb.store.findFirst({
      where: {
        customerId,
      },
    });
    if (!store) {
      throw new Error("Could not find and store to upsert the subscription");
    }

    const data = {
      active:
        subscription.status === "true" || subscription.status === "active",
      storeId: store.id,
      customerId,
      price: `${subscription.amount / 100}`,
      currentPeriodEndDate: new Date(subscription.next_payment_date),
      priceId: subscription.plan.plan_code,
      subscriptionId: subscription.subscription_code,
      plan: subscription.plan.plan_code,
    };

    const res = await prismadb.subscription.upsert({
      where: {
        storeId: store.id,
      },
      create: data,
      update: data,
    });
    console.log(
      `🟢 Created Subscription for ${subscription.subscription_code}`
    );
    return res;
  } catch (error) {
    console.log("🔴 Error from Create action", error);
  }
};

export const getPlans = async () => {
  const plans = await paystack.plan.list();
  return plans;
};

export const getCustomer = async (customerId: string) => {
  const customer = await paystack.customer.fetch(customerId);
  return customer;
};

export const getSubscriptionByCustomer = async (customerId: number) => {
  const sub = await paystack.subscription.list({ customer: customerId });
  return sub;
};

export const getSubscriptions = async () => {
  const sub = await paystack.subscription.list();
  return sub;
};

export const subscriptionCreate = async (customerId: number, code: string) => {
  const sub = await getSubscriptionByCustomer(customerId);
  //@ts-ignore
  const activeSub = sub.data.filter(
    (subscription: { status: string }) => subscription.status === "active"
  );
  const subscription = await subscriptionCreated(activeSub[0], code);
  return subscription;
};
/*export const getConnectAccountProducts = async (stripeAccount: string) => {
  const products = await stripe.products.list(
    {
      limit: 50,
      expand: ['data.default_price'],
    },
    {
      stripeAccount,
    }
  )
  return products.data
}*/
