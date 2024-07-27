"use client";

import { useForm } from "react-hook-form";

import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ImageUpload from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/hooks/use-current-user";
import { updateUser } from "@/lib/queries/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  firstName: z
    .string({
      required_error: "First name is required.",
    })
    .min(2, { message: "Name must be atleast 2 characters." }),
  lastName: z
    .string({
      required_error: "Last name is required.",
    })
    .min(1),
  image: z.optional(z.string()),
  isTwoFactorEnabled: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof formSchema>;

const ProfileForm = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [loading, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      image: "",
      isTwoFactorEnabled: false,
    },
  });

  useEffect(() => {
    if (isLoaded && user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        image: user.image || "",
        isTwoFactorEnabled: user.isTwoFactorEnabled || false,
      });
    }
  }, [form, isLoaded, user]);

  if (!isLoaded || !user) {
    return null;
  }

  const onSubmit = async (data: ProfileFormValues) => {
    startTransition(async () => {
      const newData = { ...data, userId: user.id };
      const response = await updateUser(newData);
      if (response.success) {
        toast({ description: response.success });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Ooh Something went wrong",
          description: response.error,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  disabled={loading}
                  className="object-contain"
                  onChange={(url) => field.onChange(url)}
                  onRemove={() => field.onChange("")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="First name" {...field} />
              </FormControl>
              <FormDescription>This is your first name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="Last name" {...field} />
              </FormControl>
              <FormDescription>This is your last name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isTwoFactorEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Two factor authentication
                </FormLabel>
                <FormDescription>
                  Enable two factor authentication for added security
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button disabled={loading} className="ml-auto" type="submit">
          Update Profile&nbsp; {loading && <Spinner />}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
