"use client";
import {
  saveActivityLogsNotification,
  sendInvitation,
} from "@/lib/queries/invitation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "./Spinner";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "./ui/use-toast";

interface SendInvitationProps {
  storeId: string;
  onClose: () => void;
}

const SendInvitation: React.FC<SendInvitationProps> = ({
  storeId,
  onClose,
}) => {
  const router = useRouter();
  const userDataSchema = z.object({
    email: z.string().email(),
    role: z.enum(["STORE_OWNER", "STAFF_USER"]),
  });

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: "STAFF_USER",
    },
  });

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    const response = await sendInvitation(values.email, values.role, storeId);

    if (response.success) {
      const res = await saveActivityLogsNotification({
        storeId: storeId,
        description: `Invited ${values.email}`,
      });

      if (res.success) {
        toast({
          description: response.success,
        });
      } else {
        toast({
          variant: "destructive",
          description: res.error,
        });
      }
    } else {
      toast({
        variant: "destructive",
        description: response.error,
      });
    }

    onClose();
    router.refresh();
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Invitation</CardTitle>
        <CardDescription>
          An invitation will be sent to the user. Users who already have an
          invitation sent out to their email, will not receive another
          invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={form.formState.isSubmitting}
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User role</FormLabel>
                  <Select
                    disabled={form.formState.isSubmitting}
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STORE_OWNER">Store Admin</SelectItem>
                      <SelectItem value="STAFF_USER">
                        Staff Account User
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Spinner /> : "Send Invitation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SendInvitation;
