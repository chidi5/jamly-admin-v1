import prismadb from "@/lib/prismadb";
import { getUser } from "@/lib/queries";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import SettingsForm from "./components/settings-form";

type SettingsProps = {
  params: { storeId: string };
};

const SettingsPage = async ({ params }: SettingsProps) => {
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
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <SettingsForm initialData={store} user={user} />
      </div>
    </div>
  );
};

export default SettingsPage;
