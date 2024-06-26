"use client";

import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { useStoreModal } from "@/hooks/use-store-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GetUserLocation from "../get-user-location";

const formSchema = z.object({
  name: z.string().min(1),
});

const StoreModal = () => {
  const storeModal = useStoreModal();

  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({});
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      let customerId;
      const data = {
        email: session?.user.email,
        first_name: session?.user.firstName,
        last_name: session?.user.lastName,
      };
      const customerResponse = await axios.post(
        "/api/paystack/create-customer",
        data
      );
      customerId = customerResponse.data.customerId;

      const dataToSend = {
        ...values,
        customerId,
        ...location,
      };
      const response = await axios.post("/api/stores", dataToSend);
      toast({ description: "Store created successfully" });
      if (plan) {
        window.location.assign(
          `/store/${response.data.id}/billing?plan=${plan}`
        );
      } else {
        window.location.assign(`/store/${response.data.id}`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error || "There was a problem with your request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create store"
      description="Add new store to manage products and categories"
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <div>
        <GetUserLocation setLocation={setLocation} />
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                  <Button
                    disabled={loading}
                    variant="outline"
                    onClick={storeModal.onClose}
                  >
                    Cancel
                  </Button>
                  <Button disabled={loading} type="submit">
                    Continue&nbsp; {loading && <Spinner />}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StoreModal;
