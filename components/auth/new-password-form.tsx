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
import { NewPassword } from "@/lib/queries/new-password";
import { NewPasswordSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../Spinner";
import CardWrapper from "../card-wrapper";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type UserFormData = z.infer<typeof NewPasswordSchema>;

export const NewPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await NewPassword(data, token);
      setError(response.error);
      setSuccess(response.success);
    });
  };

  return (
    <CardWrapper
      headerLabel="Reset Password?"
      headerDescription="Enter new password to reset"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      disabled={loading}
                      placeholder="Password"
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
