import { ExistingUserInviteForm } from "@/components/auth/existing-user-invite-form";
import { Suspense } from "react";

const JoinTeamPage = () => {
  return (
    <Suspense>
      <ExistingUserInviteForm />
    </Suspense>
  );
};

export default JoinTeamPage;
