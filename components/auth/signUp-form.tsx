"use client";

import React, { useEffect, useState, useTransition } from "react";
import CardWrapper from "../card-wrapper";
import { SignUpSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Spinner from "../Spinner";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { SignUp } from "@/lib/queries/user";
import { checkInvitation } from "@/lib/queries/invitation";

type UserFormData = z.infer<typeof SignUpSchema>;

export const SignUpForm = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkExistingUser = async () => {
      if (token) {
        const response = await checkInvitation(token);

        if (response.userExists) {
          router.push(`/join-team?token=${token}`);
        }
      }
    };
    checkExistingUser();
  }, [token, router]);

  const onSubmit = async (data: UserFormData) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const newdata = token ? { ...data, token: token } : data;
      const response = await SignUp(newdata);
      setError(response.error);
      setSuccess(response.success);
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      headerDescription="to continue to Jamly"
      backButtonLabel="Already have an account?"
      backButtonHref="/sign-in"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                <FormLabel>Password</FormLabel>
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
