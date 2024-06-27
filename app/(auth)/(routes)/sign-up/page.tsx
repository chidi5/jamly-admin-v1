import { SignUpForm } from "@/components/auth/signUp-form";
import { Suspense } from "react";

const SignUpPage = () => {
  return (
    <Suspense>
      {" "}
      <SignUpForm />
    </Suspense>
  );
};

export default SignUpPage;
