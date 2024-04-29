import { verifyAndAcceptInvitation } from "@/lib/queries";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const layout = async ({
  children,
  searchParams,
}: {
  children: ReactNode;
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  const storeId = await verifyAndAcceptInvitation();

  if (storeId) {
    redirect(`/store?plan=${searchParams.plan}`);
  }

  return <div>{children}</div>;
};

export default layout;
