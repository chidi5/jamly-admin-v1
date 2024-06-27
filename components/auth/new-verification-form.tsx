"use client";

import { newVerification } from "@/lib/queries/new-verification";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { BeatLoader } from "react-spinners";
import Spinner from "../Spinner";
import CardWrapper from "../card-wrapper";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleResend = () => {
    startTransition(async () => {
      try {
        const response = await axios.post("/api/resend-verification-email", {
          token,
        });

        if (response.status === 200) {
          setSuccess("Verification email resent successfully.");
          //setError("");
        } else {
          setError(
            response.data.error || "Failed to resend verification email."
          );
        }
      } catch (error: any) {
        setError(
          error.response?.data?.error || "Failed to resend verification email."
        );
      }
    });
  };

  const onSubmit = useCallback(async () => {
    if (!token) {
      setError("Missing token");
      return;
    }
    try {
      const response = await newVerification(token);
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
      headerLabel="Email verification"
      headerDescription="Confirming your email address"
      backButtonLabel="Back to Login"
      backButtonHref="/sign-in"
    >
      <div className="flex flex-col space-y-3 w-full">
        {!success && !error && <BeatLoader size={9} />}
        {!success && error !== "Token does not exist!" && error && (
          <Button onClick={handleResend}>
            Resend verification...&nbsp;{loading && <Spinner />}
          </Button>
        )}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};
