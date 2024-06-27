"use client";

import Spinner from "@/components/Spinner";
import { ApiAlert } from "@/components/ui/api-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useOrigin } from "@/hooks/use-origin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store } from "@prisma/client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type AccountSettingsFormProps = {
  initialData: Store;
};

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be atleast 2 characters." }),
  storeLogo: z
    .string({
      required_error: "Please enter a valid Image.",
    })
    .min(1),
  companyEmail: z
    .string({
      required_error: "Please enter a valid email.",
    })
    .email(),
  companyPhone: z
    .string({
      required_error: "Please enter a valid number.",
    })
    .min(1, { message: "Please enter a valid number." }),
  address: z
    .string({
      required_error: "Address is required.",
    })
    .min(1),
  city: z
    .string({
      required_error: "City is required.",
    })
    .min(1),
  zipCode: z
    .string({
      required_error: "Zip code is required.",
    })
    .min(1),
  state: z
    .string({
      required_error: "State is required.",
    })
    .min(1),
});

type AccountSettingsFormValues = z.infer<typeof formSchema>;

const AccountSettingsForm = ({ initialData }: AccountSettingsFormProps) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [loading, startTransition] = useTransition();

  const form = useForm<AccountSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          storeLogo: initialData?.storeLogo || undefined,
          companyEmail: initialData?.companyEmail || undefined,
          companyPhone: initialData?.companyPhone || undefined,
          address: initialData?.address || undefined,
          city: initialData?.city || undefined,
          zipCode: initialData?.zipCode || undefined,
          state: initialData?.state || undefined,
        }
      : {
          name: "",
          storeLogo: "",
          companyEmail: "",
          companyPhone: "",
          address: "",
          city: "",
          zipCode: "",
          state: "",
        },
  });

  const onSubmit = async (data: AccountSettingsFormValues) => {
    startTransition(async () => {
      try {
        await axios.patch(`/api/stores/${params.storeId}`, data);
        router.refresh();
        toast({ description: "Store updated." });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          "There was a problem with your request";
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong",
          description: errorMessage,
        });
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>
                Your profile is what people will see on search results,
                invoices, chat and more.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="py-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Store name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is your store name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          disabled={loading}
                          placeholder="Company Email"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is your company email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storeLogo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Logo</FormLabel>
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
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Company Phone"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Let customers know where your business is based.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="py-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="City"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="State"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zipcode</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Zip Code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Button disabled={loading} className="ml-auto" type="submit">
            Save changes&nbsp; {loading && <Spinner />}
          </Button>
        </form>
      </Form>

      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        variant="public"
        description={`${origin}/api/${params.storeId}`}
      />
    </>
  );
};

export default AccountSettingsForm;
