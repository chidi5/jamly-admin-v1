import { verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const storeId = await verifyAndAcceptInvitation();

  if (storeId) {
    redirect("/store");
  }

  return <div>{children}</div>;
};

export default layout;
