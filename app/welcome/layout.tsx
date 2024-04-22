import prismadb from "@/lib/prismadb";
import { verifyAndAcceptInvitation } from "@/lib/queries";
import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  /*const store = await prismadb.store.findFirst({
    where: {
      users: user.id,
    },
  });*/
  const storeId = await verifyAndAcceptInvitation();

  if (storeId) redirect(`/store/${storeId}`);

  return <div>{children}</div>;
};

export default layout;
