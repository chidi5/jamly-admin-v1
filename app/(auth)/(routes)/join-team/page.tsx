import { Suspense } from "react";
import { ExistingUserInviteForm } from "@/components/auth/existing-user-invite-form";

const JoinTeamPage = () => {
  return (
    <Suspense>
      <ExistingUserInviteForm />
    </Suspense>
  );
};

export default JoinTeamPage;
