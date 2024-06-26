import Navbar from "@/components/Navbar";
import WidthWrapper from "@/components/WidthWrapper";
import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import CustomModalProvider from "@/providers/cutom-modal-provider";
import { ThemeProvider } from "@/providers/theme-provider";
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
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Navbar />
        <WidthWrapper className="lg:px-10 py-8">
          <CustomModalProvider>{children}</CustomModalProvider>
        </WidthWrapper>
      </ThemeProvider>
    </>
  );
}
