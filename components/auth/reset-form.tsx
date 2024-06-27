"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Reset } from "@/lib/queries/reset";
import { ResetSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../Spinner";
import CardWrapper from "../card-wrapper";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";

type UserFormData = z.infer<typeof ResetSchema>;

export const ResetForm = () => {
  const router = useRouter();

  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<UserFormData>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await Reset(data);
      setError(response.error);
      setSuccess(response.success);
    });
  };

  return (
    <CardWrapper
      headerLabel="Forgot Password?"
      headerDescription="Enter email to reset password"
      backButtonLabel="Back to login"
      backButtonHref="/sign-in"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={loading}
                    placeholder="Email address"
                    {...field}
                  />
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
