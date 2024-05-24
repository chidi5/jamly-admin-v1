"use client";

import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { updateUser } from "@/lib/queries";
import { User } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";

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
  imageUrl: z
    .string({
      required_error: "Please enter a valid Image.",
    })
    .min(1),
});

type ProfileFormValues = z.infer<typeof formSchema>;

const ProfileForm = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl || "",
      });
    }
  }, [isLoaded, isSignedIn, user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    try {
      await updateUser(data);
      toast({ description: "Profile updated successfully" });
    } catch (error) {
      toast({
        title: "Ooh Something went wrong",
        description: `Error updating profile: ${error}`,
      });
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  disabled={loading}
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
        <Button disabled={loading} className="ml-auto" type="submit">
          Update Profile&nbsp; {loading && <Spinner />}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
