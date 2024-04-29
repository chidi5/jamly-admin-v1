import Navbar from "@/components/Navbar";
import WidthWrapper from "@/components/WidthWrapper";
import prismadb from "@/lib/prismadb";
import CustomModalProvider from "@/providers/cutom-modal-provider";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { storeId: string };
}) {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const store = await prismadb.store.findFirst({
    where: {
      AND: [{ id: params.storeId }, { users: { some: { id: user.id } } }],
    },
  });

  if (!store) redirect("/welcome");

  return (
    <>
      <Navbar />
      <WidthWrapper className="lg:px-10 py-8">
        <CustomModalProvider>{children}</CustomModalProvider>
      </WidthWrapper>
    </>
  );
}
