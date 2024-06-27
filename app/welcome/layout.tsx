import { currentUser } from "@/hooks/use-current-user";
import { verifyAndAcceptInvitation } from "@/lib/queries/invitation";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const storeId = await verifyAndAcceptInvitation();

  if (storeId) {
    redirect("/store");
  }

  return <div>{children}</div>;
};

export default layout;
