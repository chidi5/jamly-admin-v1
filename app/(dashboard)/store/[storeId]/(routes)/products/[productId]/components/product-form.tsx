"use client";

import Spinner from "@/components/Spinner";
import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useOrigin } from "@/hooks/use-origin";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Image, Product } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import axios from "axios";
import { url } from "inspector";
import { Plus, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

interface Variant {
  id: string;
  title: string;
  productId: string;
  price: Decimal;
  inventory: number;
  selectedOptions: { option: { name: string }; value: any }[]; // Adjust based on your specific type structure
}

type ProductFormProps = {
  initialData: (Product & { images: Image[] } & { variants: Variant[] }) | null;
  categories: Category[];
};

const optionValueSchema = z.object({
  name: z.string().min(1),
});

const optionSchema = z.object({
  optionName: z.string().min(1),
  optionValues: z.array(optionValueSchema),
});

const variantSchema = z.object({
  title: z.string().min(1),
  price: z.coerce.number().positive("Price must be positive"),
  inventory: z.coerce.number().positive("Inventory must be positive"),
});

const formSchema = z.object({
  name: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  categoryId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  variants: z.array(variantSchema),
  options: z.array(optionSchema),
});

type ProductFormValues = z.infer<typeof formSchema>;

const ProductForm = ({ initialData, categories }: ProductFormProps) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHiddden, setIshidden] = useState(initialData ? false : true);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product." : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: parseFloat(String(initialData?.price)),
          variants: initialData.variants
            ? initialData.variants.map((variant) => ({
                ...variant,
                price: parseFloat(String(variant.price)),
              }))
            : [],
        }
      : {
          name: "",
          images: [],
          price: 0,
          categoryId: "",
          isFeatured: false,
          isArchived: false,
          variants: [],
          options: [],
        },
  });

  const { control, getValues } = form;

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: "options",
  });

  useEffect(() => {
    if (initialData) {
      const formattedOptions = initialData.variants.reduce(
        (
          acc: { optionName: string; optionValues: { name: string }[] }[],
          variant: Variant
        ) => {
          const sortedOptions = variant.selectedOptions.sort((a, b) =>
            a.option.name.localeCompare(b.option.name)
          );

          sortedOptions.forEach(
            (optionValue: { option: { name: string }; value: any }) => {
              const existingOption = acc.find(
                (opt) => opt.optionName === optionValue?.option?.name
              );
              if (existingOption) {
                // Check if the option value already exists to avoid duplicates
                const valueExists = existingOption.optionValues.some(
                  (val) => val.name === optionValue.value
                );
                if (!valueExists) {
                  existingOption.optionValues.push({ name: optionValue.value });
                }
              } else {
                acc.push({
                  optionName: optionValue.option.name,
                  optionValues: [{ name: optionValue.value }],
                });
              }
            }
          );

          return acc;
        },
        []
      );

      appendOption(formattedOptions);

      console.log(formattedOptions);
    }
  }, [initialData, appendOption]);

  function generateVariantTitles(options: any[]) {
    let titles: string[] = [];

    function buildTitles(index: number, prefix: string) {
      const option = options[index];
      if (!option) {
        titles.push(prefix.substring(1)); // Remove leading "-"
        return;
      }

      option.optionValues.forEach((value: { name: any }) => {
        buildTitles(index + 1, `${prefix}-${value.name}`);
      });
    }

    buildTitles(0, "");
    return titles;
  }

  const handleVariant = () => {
    const options = getValues("options"); // Get form values
    const newVariantTitles = generateVariantTitles(options);
    setIshidden(false);

    if (variantFields.length > 0) {
      for (let i = variantFields.length - 1; i >= 0; i--) {
        removeVariant(i);
      }
    }

    newVariantTitles.forEach((title) =>
      appendVariant({
        title: title,
        price: 0,
        inventory: 0,
      })
    );
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.push(`/store/${params.storeId}/products`);
      router.refresh();
      toast({ description: toastMessage });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.push(`/store/${params.storeId}/products`);
      router.refresh();
      toast({ description: "Product deleted." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
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
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value.map((image) => image.url)}
                    disabled={loading}
                    onChange={(url) =>
                      field.onChange([...field.value, { url }])
                    }
                    onRemove={(url) =>
                      field.onChange([
                        ...field.value.filter((current) => current.url !== url),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="9.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a category"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      checked={field.value}
                      // @ts-ignore
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      This product will appear on the home page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>
                      This product will not appear anywhere in the store.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Heading
              title="Variant"
              description="Product options and  variant"
            />
            <div className="space-x-3">
              <Button
                type="button"
                disabled={loading || optionFields.length === 0}
                variant="outline"
                size="sm"
                onClick={handleVariant}
              >
                <Plus className="h-4 w-4" /> Generate variant
              </Button>
              <Button
                type="button"
                disabled={loading}
                size="sm"
                onClick={() =>
                  appendOption({
                    optionName: "",
                    optionValues: [{ name: "" }],
                  })
                }
              >
                <Plus className="h-4 w-4" /> Add Option
              </Button>
            </div>
          </div>

          <Separator className=" !mt-4" />

          <div className="grid grid-cols-3 gap-8">
            {optionFields.map((option, index) => (
              <div>
                <FormField
                  key={option.id}
                  control={form.control}
                  name={`options.${index}.optionName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center justify-between">
                          <div>Option Name</div>
                          <Button
                            type="button"
                            disabled={loading}
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Option Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <OptionValuesFieldArray
                  form={form}
                  loading={loading}
                  nestIndex={index}
                  {...{ control }}
                />
              </div>
            ))}
          </div>

          <>
            <div
              className={cn("grid grid-cols-3 gap-4", {
                hidden: isHiddden,
              })}
            >
              <FormLabel>Name</FormLabel>
              <FormLabel>Price</FormLabel>
              <FormLabel>Inventory</FormLabel>
            </div>
            {variantFields.map((variant, variantIndex) => (
              <div key={variant.id} className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`variants.${variantIndex}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          disabled
                          placeholder="Variant title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${variantIndex}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="9.99"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-3">
                  <FormField
                    control={form.control}
                    name={`variants.${variantIndex}.inventory`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            type="number"
                            disabled={loading}
                            placeholder="20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    disabled={loading}
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(variantIndex)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}&nbsp; {loading && <Spinner />}
          </Button>
        </form>
      </Form>
    </>
  );
};

const OptionValuesFieldArray = ({
  form,
  loading,
  nestIndex,
  control,
}: {
  form: any;
  loading: boolean;
  nestIndex: any;
  control: any;
}) => {
  const {
    fields: optionValueFields,
    append: appendOptionValue,
    remove: removeOptionValue,
  } = useFieldArray({
    control,
    name: `options.${nestIndex}.optionValues`,
  });

  return (
    <div className="mt-6">
      {optionValueFields.map((item, k) => (
        <div className="flex space-x-2 items-center">
          <FormField
            key={item.id}
            control={form.control}
            name={`options.${nestIndex}.optionValues.${k}.name`}
            render={({ field }) => (
              <FormItem>
                <FormControl className="mt-2">
                  <Input
                    disabled={loading}
                    placeholder="Option Value"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            disabled={k == 0 ? true : loading}
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => removeOptionValue(k)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        disabled={loading}
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={() => appendOptionValue({ value: "" })}
      >
        <Plus className="h-4 w-4" />
        &nbsp; Add option value
      </Button>
    </div>
  );
};

export default ProductForm;
