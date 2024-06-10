import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import prismadb from "@/lib/prismadb";
import { getUser } from "@/lib/queries";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import AccountSettingsForm from "./settings-form";

type SettingsProps = {
  params: { storeId: string };
};

const AccountsPage = async ({ params }: SettingsProps) => {
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

  return (
    <div className="space-y-6">
      <Heading
        title="Account"
        description="Update your account settings. Set your preferred language and timezone."
        className="!text-2xl font-medium"
      />
      <Separator />
      <AccountSettingsForm initialData={store} user={user} />
    </div>
  );
};

export default AccountsPage;
