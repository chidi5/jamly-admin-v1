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
import { toast } from "@/components/ui/use-toast";
import { useOrigin } from "@/hooks/use-origin";
import { useModal } from "@/providers/cutom-modal-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type CategoryFormValues = z.infer<typeof formSchema>;

const CategoryModalForm = () => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();
  const { setClose } = useModal();

  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      await axios.post(`/api/${params.storeId}/categories`, data);
      router.refresh();
      setClose();
      toast({ description: "Category created." });
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="Category Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading} className="ml-auto" type="submit">
          Save&nbsp; {loading && <Spinner />}
        </Button>
      </form>
    </Form>
  );
};

export default CategoryModalForm;
