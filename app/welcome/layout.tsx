import { verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const storeId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (storeId) {
    redirect("/store");
  }

  return <div>{children}</div>;
};

export default layout;
