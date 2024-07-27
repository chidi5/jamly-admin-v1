import { currentUser } from "@/hooks/use-current-user";
import { verifyAndAcceptInvitation } from "@/lib/queries/invitation";
import { getUserbyId } from "@/lib/queries/user";
import { signOut } from "next-auth/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const session = await currentUser();

  if (!session) {
    redirect("/sign-in");
  }

  const user = await getUserbyId(session.id);

  if (!user) {
    const cookieStore = cookies();
    cookieStore.getAll().forEach((cookie) => {
      cookieStore.delete(cookie.name);
    });
    await signOut({
      redirect: false,
    });
    redirect("/sign-in");
  }

  const storeId = await verifyAndAcceptInvitation();

  if (storeId) {
    redirect("/store");
  }

  return <div>{children}</div>;
};

export default layout;
