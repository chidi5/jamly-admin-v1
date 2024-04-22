import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const LandingPage = async () => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const storeId = await verifyAndAcceptInvitation();

  if (storeId) {
    redirect(`/store/${storeId}`);
  } else {
    redirect("/welcome");
  }

  return null;
};

export default LandingPage;
