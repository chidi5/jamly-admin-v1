import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";

const LandingPage = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  const user = await getAuthUserDetails();

  const storeId = await verifyAndAcceptInvitation();

  if (!user) {
    if (searchParams.plan) {
      redirect(`/sig-in?plan=${searchParams.plan}`);
    } else {
      redirect("/sign-in");
    }
  }

  if (storeId) {
    if (user?.role === "STORE_OWNER") {
      if (searchParams.plan) {
        return redirect(`/store/${storeId}/billing?plan=${searchParams.plan}`);
      }
      if (searchParams.state) {
        const statePath = searchParams.state.split("___")[0];
        const stateStoreId = searchParams.state.split("___")[1];
        if (!stateStoreId) return <div>Not authorized</div>;
        return redirect(
          `/store/${stateStoreId}/${statePath}?code=${searchParams.code}`
        );
      } else return redirect(`/store/${storeId}`);
    }
  } else {
    if (searchParams.plan) {
      redirect(`/welcome?plan=${searchParams.plan}`);
    } else {
      redirect("/welcome");
    }
  }

  return null;
};

export default LandingPage;
