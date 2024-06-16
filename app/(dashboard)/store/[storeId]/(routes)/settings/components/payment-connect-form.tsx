"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentConfig } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/cutom-modal-provider";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { decrypt } from "@/lib/queries";

type PaymentConnectFormProps = {
  initialData: PaymentConfig | undefined;
  provider: string;
  storeId: string;
};

const formSchema = z.object({
  publicKey: z.string().min(1, "Public key is required"),
  secretKey: z.string().min(1, "Secret key is required"),
  isActive: z.boolean().default(true).optional(),
});

type PaymentConnectFormValues = z.infer<typeof formSchema>;

const PaymentConnectForm = ({
  initialData,
  provider,
  storeId,
}: PaymentConnectFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setClose } = useModal();
  const [decrypted, setDecrypted] = useState("");

  const toastMessage = initialData
    ? "Payment config updated."
    : "Payment succefully connected.";
  const action = initialData ? "Save changes" : "Connect";

  const form = useForm<PaymentConnectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      publicKey: "",
      secretKey: "",
      isActive: true,
    },
  });

  useEffect(() => {
    const handleDecrypt = async () => {
      if (initialData) {
        const secretKey = await decrypt(initialData.secretKey);
        setDecrypted(secretKey);
      }
    };

    handleDecrypt();
  }, [initialData]);

  useEffect(() => {
    if (decrypted && initialData) {
      form.reset({
        ...initialData,
        secretKey: decrypted,
      });
    }
  }, [decrypted, initialData, form]);

  const onSubmit = async (data: PaymentConnectFormValues) => {
    try {
      setLoading(true);
      const newData = { ...data, provider };
      if (initialData) {
        await axios.patch(
          `/api/${storeId}/payment-config/${initialData.id}`,
          newData
        );
      } else {
        await axios.post(`/api/${storeId}/payment-config`, newData);
      }
      setClose();
      router.push(`/store/${storeId}/settings/payment`);
      router.refresh();
      toast({ description: toastMessage });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message || "There was a problem with your request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="publicKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public key</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="Public Key" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secretKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secret key</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="Secret key" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading} className="ml-auto" type="submit">
          {action}&nbsp; {loading && <Spinner />}
        </Button>
      </form>
    </Form>
  );
};

export default PaymentConnectForm;
