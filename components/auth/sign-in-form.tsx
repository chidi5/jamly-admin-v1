"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignIn } from "@/lib/queries/user";
import { cn } from "@/lib/utils";
import { SignInSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../Spinner";
import CardWrapper from "../card-wrapper";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

type UserFormData = z.infer<typeof SignInSchema>;

export const SignInForm = () => {
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await SignIn(data);
      if (response?.error) {
        setError(response.error);
      }
      if (response?.success) {
        form.reset();
        setSuccess(response.success);
      }
      if (response?.twoFactor) {
        setShowTwoFactor(true);
      }
    });
  };

  return (
    <CardWrapper
      headerLabel="Sign in"
      headerDescription="to continue to Jamly"
      backButtonLabel="Don't have an account?"
      backButtonHref="/sign-up"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          {showTwoFactor && (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP disabled={loading} maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>
                    Please enter the one-time password sent to your phone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {!showTwoFactor && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input type="email" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center">
                        <>Password</>
                        <Button
                          size="sm"
                          variant="link"
                          asChild
                          className="p-0 font-normal ml-auto text-muted-foreground"
                        >
                          <Link href="/reset">Forgot password?</Link>
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          disabled={loading}
                          {...field}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                          <EyeIcon
                            onClick={() => setShowPassword(!showPassword)}
                            className={cn(
                              "w-4 h-4 text-muted-foreground cursor-pointer",
                              showPassword && "hidden"
                            )}
                          />
                          <EyeOffIcon
                            onClick={() => setShowPassword(!showPassword)}
                            className={cn(
                              "w-4 h-4 text-muted-foreground cursor-pointer",
                              !showPassword && "hidden"
                            )}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Continue &nbsp; {loading && <Spinner />}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
