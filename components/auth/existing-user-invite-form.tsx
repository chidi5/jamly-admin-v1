"use client";

import { joinTeam } from "@/lib/queries/invitation";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import CardWrapper from "../card-wrapper";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

export const ExistingUserInviteForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(async () => {
    if (!token) {
      setError("Missing token");
      return;
    }
    try {
      const response = await joinTeam(token);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(response.success);
      }
    } catch (error) {
      setError("Something went wrong");
    }
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Invitation Verification"
      headerDescription="verifying your invitation"
      backButtonLabel="Back to Login"
      backButtonHref="/sign-in"
    >
      <div className="flex flex-col space-y-3 w-full">
        {!success && !error && <BeatLoader size={9} />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};
