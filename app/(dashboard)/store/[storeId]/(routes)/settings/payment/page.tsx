import PaymentForm from "@/app/(dashboard)/store/[storeId]/(routes)/settings/payment/payment-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import { Dot } from "lucide-react";
import { redirect } from "next/navigation";

type PaymentProps = {
  params: { storeId: string };
};

const Paymentpage = async ({ params }: PaymentProps) => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const store = await prismadb.store.findFirst({
    where: {
      AND: [{ id: params.storeId }, { users: { some: { id: user.id } } }],
    },
    include: {
      paymentConfigs: true,
    },
  });

  if (!store) redirect("/store");
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Heading
          title="Accept Payments"
          description="Add your payment provider so your customers can pay."
          className="!text-2xl font-medium"
        />
        <div className="flex items-center text-indigo-600">
          <Dot />
          &nbsp;{store.country}
        </div>
      </div>
      <Separator />
      <PaymentForm store={store} />
    </div>
  );
};

export default Paymentpage;
