import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import prismadb from "@/lib/prismadb";
import { getUser } from "@/lib/queries";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import AccountSettingsForm from "./settings-form";
import { currentUser } from "@/hooks/use-current-user";

type SettingsProps = {
  params: { storeId: string };
};

const AccountsPage = async ({ params }: SettingsProps) => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const store = await prismadb.store.findFirst({
    where: {
      AND: [{ id: params.storeId }, { users: { some: { id: user.id } } }],
    },
  });

  if (!store) redirect("/store");

  return (
    <div className="space-y-6">
      <Heading
        title="Account"
        description="Update your account settings. Set your preferred language and timezone."
        className="!text-2xl font-medium"
      />
      <Separator />
      <AccountSettingsForm initialData={store} />
    </div>
  );
};

export default AccountsPage;
