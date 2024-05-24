import prismadb from "@/lib/prismadb";
import { getUser } from "@/lib/queries";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import SettingsForm from "./settings-form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";

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
        className="!text-lg font-medium"
      />
      <Separator />
      <SettingsForm initialData={store} user={user} />
    </div>
  );
};

export default AccountsPage;
