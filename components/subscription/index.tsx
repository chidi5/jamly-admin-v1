"use client";

import { useToast } from "@/components/ui/use-toast";
import { subscriptionCreate } from "@/lib/paystack/action";
import { cn } from "@/lib/utils";
import { useModal } from "@/providers/cutom-modal-provider";
import { useUser } from "@clerk/nextjs";
import { Plan } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaystackButton } from "react-paystack";
import { buttonVariants } from "../ui/button";

type Props = {
  selectedPlanId: string | Plan;
  price: number;
  customerId: string;
  planExists: boolean;
};

const SubscriptionForm = ({
  selectedPlanId,
  price,
  customerId,
  planExists,
}: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const { setClose } = useModal();
  const { user } = useUser();

  const publicKey = `${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`;

  const config = {
    reference: new Date().getTime().toString(),
    email: user?.emailAddresses[0].emailAddress!,
    amount: price, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    plan: selectedPlanId,
    publicKey: publicKey,
  };

  const handlePaystackSuccessAction = async (reference: string) => {
    toast({
      title: "Payment successfull",
      description: "Your payment has been successfully processed. ",
    });
    router.push("/store");
    console.log(reference);
  };

  const handlePaystackCloseAction = () => {
    console.log("closed");
  };

  const componentProps = {
    ...config,
    text: "Subscribe",
    onSuccess: (reference: string) => handlePaystackSuccessAction(reference),
    onClose: handlePaystackCloseAction,
  };

  return (
    <Link href="#" className="w-full" onClick={() => setClose()}>
      <PaystackButton
        className={cn(buttonVariants(), "w-full")}
        {...componentProps}
      />
    </Link>
  );
};
export default SubscriptionForm;
