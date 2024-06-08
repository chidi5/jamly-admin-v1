import { Metadata } from "next";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./components/sidebar-nav";
import StoreDelete from "./components/store-delete";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import prismadb from "@/lib/prismadb";

export const metadata: Metadata = {
  title: "Settings",
  description: "Handle your store settings.",
};

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: { storeId: string };
}

export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getUser(userId);
  if (!user) redirect("/sign-in");

  const store = await prismadb.store.findFirst({
    where: {
      AND: [{ id: params.storeId }, { users: { some: { id: userId } } }],
    },
  });

  if (!store) redirect("/store");

  const sidebarNavItems = [
    {
      title: "Profile",
      href: `/store/${params.storeId}/settings`,
    },
    {
      title: "Account",
      href: `/store/${params.storeId}/settings/account`,
    },
    {
      title: "Payment",
      href: `/store/${params.storeId}/settings/account`,
    },
  ];

  return (
    <>
      <div className="hidden space-y-6 p-8 pb-16 md:block">
        <div className="flex">
          <Heading
            title="Settings"
            description="Manage your account settings and set preferences."
          />
          <StoreDelete user={user} className="ml-auto" params={params} />
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col p-4 space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 !mx-20">{children}</div>
        </div>
      </div>
    </>
  );
}
