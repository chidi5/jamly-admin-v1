import { currentUser } from "@/hooks/use-current-user";
import { verifyAndAcceptInvitation } from "@/lib/queries/invitation";
import { getUserbyId } from "@/lib/queries/user";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const session = await currentUser();

  const user = await getUserbyId(session?.id!);

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
