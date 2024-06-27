"use client";

import Spinner from "@/components/Spinner";
import { AlertModal } from "@/components/modals/alert-modal";
import { CustomModal } from "@/components/modals/custom-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import ImageUpload from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useOrigin } from "@/hooks/use-origin";
import { Product } from "@/lib/types";
import { useModal } from "@/providers/cutom-modal-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import axios from "axios";
import { PlusIcon, Trash } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ProductSelectForm from "./product-select-form";

type CategoryFormProps = {
  initialData:
    | (Category & {
        products: Product[];
      })
    | null;
  products: Product[];
  storeId: string;
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isFeatured: z.boolean().default(false).optional(),
  imageUrl: z.string().url("Enter a valid URL").optional(),
  products: z.array(z.string().uuid()).optional(),
});

type CategoryFormValues = z.infer<typeof formSchema>;

const CategoryForm = ({
  initialData,
  products,
  storeId,
}: CategoryFormProps) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();
  const { setOpen: setModalOpen } = useModal();

  const [open, setOpen] = useState(false);
  const [loading, startTransition] = useTransition();

  const title = initialData ? "Edit category" : "Create category";
  const description = initialData ? "Edit a category." : "Add a new category";
  const toastMessage = initialData ? "Category updated." : "Category created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          imageUrl: initialData.imageUrl || undefined,
          products: initialData.products?.map((product) => product.id) || [],
        }
      : {
          name: "",
          isFeatured: false,
          imageUrl: undefined,
          products: [],
        },
  });

  const handleProduct = async () => {
    setModalOpen(
      <CustomModal title="Add products to category" subheading="">
        <Form {...form}>
          <ProductSelectForm products={products} storeId={storeId} />
        </Form>
      </CustomModal>
    );
  };

  const onSubmit = async (data: CategoryFormValues) => {
    startTransition(async () => {
      try {
        if (initialData) {
          await axios.patch(
            `/api/${params.storeId}/categories/${params.categoryId}`,
            data
          );
        } else {
          await axios.post(`/api/${params.storeId}/categories`, data);
        }

        router.push(`/store/${params.storeId}/categories`);
        router.refresh();

        toast({ description: toastMessage });
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

  const onDelete = async () => {
    startTransition(async () => {
      try {
        await axios.delete(
          `/api/${params.storeId}/categories/${params.categoryId}`
        );

        router.push(`/store/${params.storeId}/categories`);
        router.refresh();

        toast({ description: "Category deleted." });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          "There was a problem with your request";

        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong",
          description: errorMessage,
        });
      } finally {
        setOpen(false);
      }
    });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-10 py-10">
            {/* Left Card */}
            <div className="col-span-2 space-y-8">
              <Card className="shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Products in category</CardTitle>
                    {form.getValues("products")!.length > 0 && (
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={handleProduct}
                      >
                        <PlusIcon className="w-5 h-5" />
                        &nbsp; Add Products
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="py-5 min-h-80">
                  <FormField
                    control={form.control}
                    name="products"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mt-4">
                          {field.value!.length > 0 ? (
                            <div className="grid grid-cols-4 gap-4">
                              {field.value!.map((productId) => {
                                const product = products.find(
                                  (p) => p.id === productId
                                );
                                return (
                                  <div
                                    key={productId}
                                    className="relative w-[180px] h-[180px] rounded-md overflow-hidden"
                                  >
                                    <div className="z-10 absolute top-2 right-2">
                                      <Button
                                        type="button"
                                        onClick={() => {
                                          const updatedProducts =
                                            field.value!.filter(
                                              (id) => id !== productId
                                            );
                                          form.setValue(
                                            "products",
                                            updatedProducts
                                          );
                                        }}
                                        variant="destructive"
                                        size="sm"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    {product?.images?.[0] && (
                                      <Image
                                        fill
                                        className="object-cover"
                                        alt={product.name}
                                        src={product.images[0].url}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-3">
                              <h2 className="text-2xl font-medium">
                                Start adding products to your category
                              </h2>
                              <Button type="button" onClick={handleProduct}>
                                <PlusIcon className="w-5 h-5" />
                                &nbsp; Add Products
                              </Button>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            {/* Right Card */}
            <div className="space-y-8">
              <Card className="shadown-none">
                <CardHeader>
                  <CardTitle>Category info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
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
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
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
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            disabled={loading}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription>
                            This category will appear on the store front
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}&nbsp; {loading && <Spinner />}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default CategoryForm;
