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
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Domain } from "@prisma/client";
import axios from "axios";
import { Copy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type DomainFormProps = {
  initialData: Domain | null;
};

const formSchema = z.object({
  domain: z
    .string()
    .regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/, {
      message: "Invalid domain name",
    }),
});

type DomainFormValues = z.infer<typeof formSchema>;

const DomainForm = ({ initialData }: DomainFormProps) => {
  const params = useParams();
  const router = useRouter();

  const [domain, setDomain] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, startTransition] = useTransition();

  const form = useForm<DomainFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      domain: "",
    },
  });

  const onSubmit = async (data: DomainFormValues) => {
    startTransition(async () => {
      try {
        setDomain(data.domain);
        const response = await axios.post(
          `/api/${params.storeId}/domains/add`,
          data
        );
        setInstructions(response.data);
        toast({
          description:
            "Domain added. Please follow the instructions below to verify.",
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Error adding domain";
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong",
          description: errorMessage,
        });
      }
    });
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ description: "Copied to clipboard." });
  };

  const verifyDomain = async () => {
    startTransition(async () => {
      try {
        toast({ description: "Verifying domain..." });
        await axios.post(`/api/${params.storeId}/domains/verify`, { domain });
        toast({ description: "Domain verified successfully!" });
        router.push(`/store/${params.storeId}/settings/domain`);
        router.refresh();
      } catch (error) {
        toast({
          description:
            "Failed to verify domain. Please check your DNS settings.",
        });
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Heading
        title="Connect Domain"
        description="Jamly does not provide domain registration services. However, you can use a domain name that you already own."
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading || instructions !== ""}
                    className="py-6"
                    placeholder="eg: myawesomewebsite.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!instructions && (
            <Button disabled={loading} className="ml-auto" type="submit">
              Add Domain&nbsp; {loading && <Spinner />}
            </Button>
          )}
        </form>
      </Form>
      {instructions && (
        <div className="mt-5 p-5 border border-blue-500 space-y-6">
          <h3 className="font-semibold text-xl">DNS Setup Instructions</h3>
          <p>
            To set up your custom domain, Create a new <strong>CNAME</strong>{" "}
            record for your domain on your DNS Provider. Then,{" "}
            <strong>paste the CNAME Alias</strong> into the record so the domain
            points to your Jamly storefront.
          </p>
          <div className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="font-medium">Name</div>
              <div className="flex items-center">
                <div className="w-80 relative p-3 font-medium bg-slate-100">
                  www
                </div>
                <Button
                  className="items-center rounded-none h-12"
                  variant="outline"
                  onClick={() => onCopy("www")}
                >
                  <Copy className="w-5 h-5 text-foreground" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="font-medium">Type</div>
              <div className="flex items-center">
                <div className="w-80 relative p-3 font-medium bg-slate-100">
                  CNAME
                </div>
                <Button
                  className="items-center rounded-none h-12"
                  variant="outline"
                  onClick={() => onCopy("CNAME")}
                >
                  <Copy className="w-5 h-5 text-foreground" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="font-medium">Value</div>
              <div className="flex items-center">
                <div className="w-80 relative p-3 font-medium bg-slate-100">
                  {params.storeId}.jamly.shop
                </div>
                <Button
                  className="items-center rounded-none h-12"
                  variant="outline"
                  onClick={() => onCopy(`${params.storeId}.jamly.shop`)}
                >
                  <Copy className="w-5 h-5 text-foreground" />
                </Button>
              </div>
            </div>
          </div>
          <Button onClick={verifyDomain} disabled={loading}>
            Verify Domain&nbsp; {loading && <Spinner />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DomainForm;
