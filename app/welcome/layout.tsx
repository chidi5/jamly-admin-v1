import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import DashboardLayout from "../(dashboard)/store/[storeId]/layout";

const layout = async ({ children }: { children: ReactNode }) => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const store = await prismadb.store.findFirst({
    where: {
      userId,
    },
  });

  if (store) redirect(`/store/${store.id}`);

  return <div>{children}</div>;
};

export default layout;
