import prismadb from "@/lib/prismadb";
import LaunchPadClient from "./components/client";
import { redirect } from "next/navigation";

type LaunchPadProps = {
  params: { storeId: string };
};

const LaunchPadPage = async ({ params }: LaunchPadProps) => {
  const store = await prismadb.store.findUnique({
    where: { id: params.storeId },
  });

  if (!store) redirect("/sign-in");

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <LaunchPadClient data={store} />
      </div>
    </div>
  );
};

export default LaunchPadPage;
