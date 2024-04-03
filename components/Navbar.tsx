import React from "react";
import WidthWrapper from "@/components/WidthWrapper";
import { UserButton, auth } from "@clerk/nextjs";
import { NavItem } from "@/components/NavItem";
import StoreSwitcher from "@/components/store-switcher";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";

const Navbar = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId,
    },
  });
  return (
    <div className="sticky z-50 top-0 inset-x-0 h-16">
      <header className="relative border-b">
        <WidthWrapper>
          <div className="flex h-16 items-center">
            <StoreSwitcher items={stores} />
            <NavItem className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </WidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
