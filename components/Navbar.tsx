import { NavItem } from "@/components/NavItem";
import WidthWrapper from "@/components/WidthWrapper";
import StoreSwitcher from "@/components/store-switcher";
import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { UserButton } from "./auth/user-button";
import { ModeToggle } from "./theme-toggle";

const Navbar = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const stores = await prismadb.store.findMany({
    where: {
      AND: [{ users: { some: { id: user.id } } }],
    },
  });

  return (
    <div className="bg-background sticky z-50 top-0 inset-x-0 h-16">
      <header className="relative border-b">
        <WidthWrapper>
          <div className="flex h-16 items-center">
            <StoreSwitcher items={stores} />
            <NavItem className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <ModeToggle />
              <UserButton />
            </div>
          </div>
        </WidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
