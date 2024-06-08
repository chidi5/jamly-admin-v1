"use client";

import Spinner from "@/components/Spinner";
import { AdditionalInfoModal } from "@/components/modals/additional-info-modal";
import { AlertModal } from "@/components/modals/alert-modal";
import { OptionModal } from "@/components/modals/option-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useOrigin } from "@/hooks/use-origin";
import {
  AdditionalInfoSchema,
  CostAndProfitDataSchema,
  discountSchema,
  optionSchema,
  productFormSchema,
  stockSchema,
  variantSchema,
} from "@/lib/schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AdditionalInfoSection,
  Category,
  CostAndProfitData,
  Discount,
  Image,
  Option,
  PriceData,
  Product,
  Stock,
} from "@prisma/client";
import axios from "axios";
import "easymde/dist/easymde.min.css";
import { Plus, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import Markdown from "react-markdown";
import SimpleMDE from "react-simplemde-editor";
import { z } from "zod";
import InventoryStatusSelect, {
  inventoryStatusOptions,
} from "./inventory-status-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CustomModal } from "@/components/modals/custom-modal";
import CategoryModalForm from "./category-modal-form";
import { useModal } from "@/providers/cutom-modal-provider";

interface Variant {
  id: string;
  title: string;
  productId: string;
  priceData: PriceData | null;
  costAndProfitData: CostAndProfitData | null;
  stock: Stock | null;
  selectedOptions: { option: { name: string }; value: any }[];
}

const discountOptions = [
  { value: "AMOUNT", label: "NGN" },
  { value: "PERCENT", label: "%" },
];

type ProductFormProps = {
  initialData:
    | (Product & {
        images: Image[];
        categories: Category[];
        options: Option[];
        variants: Variant[];
        priceData: PriceData | null;
        stock: Stock | null;
        discount: Discount | null;
        costAndProfitData: CostAndProfitData | null;
        additionalInfoSections: AdditionalInfoSection[];
      })
    | null;
  categories: Category[];
};

type ProductFormValues = z.infer<typeof productFormSchema>;

const ProductForm = ({ initialData, categories }: ProductFormProps) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();
  const { setOpen: setMoadlOpen } = useModal();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<z.infer<
    typeof AdditionalInfoSchema
  > | null>(null);
  const [infoIndex, setInfoIndex] = useState(0);

  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [currentOption, setCurrentOption] = useState<z.infer<
    typeof optionSchema
  > | null>(null);

  const [isOnSale, setIsOnSale] = useState(false);
  const [isHidden, setIsHidden] = useState(
    initialData?.manageVariants ? false : true
  );
  const [isTracking, setIsTracking] = useState(false);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product." : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: initialData.priceData!.price,
          discountedPrice: initialData.priceData!.discountedPrice ?? undefined,
          weight: initialData.weight ?? undefined,
          categories: initialData.categories
            ? initialData.categories.map((category) => category.id)
            : [],
          variants: initialData.variants
            ? initialData.variants.map((variant) => ({
                ...variant,
                price: parseFloat(String(variant.priceData?.price)),
                costofgoods: parseFloat(
                  String(variant.costAndProfitData?.itemCost)
                ),
                inventory: variant.stock?.quantity ?? undefined,
                status: variant.stock?.inventoryStatus ?? undefined,
              }))
            : [],
          stock: initialData.stock
            ? {
                trackInventory: initialData.stock.trackInventory,
                quantity: initialData.stock.quantity ?? undefined,
                inventoryStatus: initialData.stock.inventoryStatus ?? undefined,
              }
            : {
                trackInventory: false,
                quantity: undefined,
                inventoryStatus: undefined,
              },
          costProfit:
            {
              itemCost: initialData?.costAndProfitData?.itemCost ?? undefined,
              profit: initialData?.costAndProfitData?.profit ?? undefined,
              profitMargin:
                initialData?.costAndProfitData?.profitMargin ?? undefined,
            } ?? undefined,
          discount:
            {
              value: initialData.discount?.value ?? undefined,
              type: initialData.discount?.type ?? undefined,
            } ?? undefined,
        }
      : {
          name: "",
          images: [],
          price: 0,
          discountedPrice: undefined,
          weight: undefined,
          description: "",
          categories: [],
          isFeatured: false,
          isArchived: false,
          manageVariants: false,
          variants: [],
          options: [],
          additionalInfoSections: [],
          stock: {
            trackInventory: false,
            quantity: undefined,
            inventoryStatus: undefined,
          },
          costProfit: {
            itemCost: 0,
            profit: undefined,
            profitMargin: undefined,
          },
          discount: {
            value: undefined,
            type: undefined,
          },
        },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const {
    fields: optionFields,
    append: appendOption,
    update: updateOption,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const {
    fields: additionalInfoFields,
    append: additionalInfoAppend,
    update: additionalInfoUpdate,
    remove: additionalInfoRemove,
  } = useFieldArray({
    control: form.control,
    name: "additionalInfoSections",
  });

  const price = useWatch({
    control: form.control,
    name: "price",
  });
  const itemCost = useWatch({
    control: form.control,
    name: "costProfit.itemCost",
  });
  const discount = useWatch({
    control: form.control,
    name: "discount.value",
  });
  const discountType = useWatch({
    control: form.control,
    name: "discount.type",
  });

  useEffect(() => {
    let salePrice = price;
    if (isOnSale) {
      if (discountType === "AMOUNT") {
        salePrice = price - discount!;
      } else if (discountType === "PERCENT") {
        salePrice = price - price * (discount! / 100);
      }
      form.setValue("discountedPrice", salePrice);
    } else {
      form.setValue("discountedPrice", undefined);
      form.setValue("discount.value", undefined);
      form.setValue("discount.type", undefined);
    }

    const profit = salePrice - itemCost!;
    form.setValue("costProfit.profit", profit);

    const profitMargin = salePrice ? (profit / salePrice) * 100 : 0;
    form.setValue(
      "costProfit.profitMargin",
      parseFloat(profitMargin.toFixed(2))
    );
  }, [isOnSale, price, discount, discountType, itemCost, form]);

  useEffect(() => {
    if (optionFields.length === 0) {
      setIsHidden(true);
      form.setValue("manageVariants", false);
    }
  }, [optionFields, form]);

  function generateVariantTitles(options: any[]) {
    let titles: string[] = [];

    function buildTitles(index: number, prefix: string) {
      const option = options[index];
      if (!option) {
        titles.push(prefix.substring(1)); // Remove leading "-"
        return;
      }

      option.values.forEach((value: { value: any }) => {
        buildTitles(index + 1, `${prefix}|${value.value}`);
      });
    }

    buildTitles(0, "");
    return titles;
  }

  const handleVariant = () => {
    const options = form.getValues("options");
    if (!options) return null;
    const newVariantTitles = generateVariantTitles(options);
    setIsHidden(false);

    if (variantFields.length > 0) {
      for (let i = variantFields.length - 1; i >= 0; i--) {
        removeVariant(i);
      }
    }

    newVariantTitles.forEach((title) => {
      const matchingVariant = initialData?.variants?.find(
        (variant) => variant.title === title
      );

      const inventory = matchingVariant?.stock?.quantity ?? 0;
      const inventoryStatus =
        matchingVariant?.stock?.inventoryStatus ?? "IN_STOCK";

      const price =
        parseFloat(String(matchingVariant?.priceData?.price)) ||
        parseFloat(String(initialData?.priceData?.price)) ||
        form.getValues("price") ||
        0;

      const costofgoods =
        parseFloat(String(matchingVariant?.costAndProfitData?.itemCost)) ?? 0;

      appendVariant({
        title: title,
        price: price,
        costofgoods: costofgoods,
        inventory: inventory,
        status: inventoryStatus,
      });
    });
  };

  const clearVariants = () => {
    form.setValue("variants", []);
  };

  const clearStockShip = () => {
    //form.setValue("weight", 0);
    form.setValue("stock", {
      trackInventory: false,
      quantity: undefined,
      inventoryStatus: undefined,
    });
  };

  useEffect(() => {
    if (!isHidden) {
      handleVariant();
      clearStockShip();
    } else {
      clearVariants();
    }
  }, [isHidden, handleVariant, clearStockShip, clearVariants]);

  const handleAddSection = (data: z.infer<typeof AdditionalInfoSchema>) => {
    if (currentSection) {
      const index = additionalInfoFields.findIndex(
        (field) => field.title === currentSection.title
      );
      additionalInfoUpdate(index, data);
    } else {
      additionalInfoAppend(data);
    }
    setIsDialogOpen(false);
    setCurrentSection(null);
  };

  const handleAddOrUpdateOption = (data: z.infer<typeof optionSchema>) => {
    if (currentOption) {
      const index = optionFields.findIndex(
        (field) => field.name === currentOption.name
      );
      updateOption(index, data);
    } else {
      appendOption(data);
    }
    setIsOptionsDialogOpen(false);
    setCurrentOption(null);
  };

  const handleCreateCategory = async () => {
    setMoadlOpen(
      <CustomModal title="Create Category" subheading="">
        <CategoryModalForm />
      </CustomModal>
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
        console.log(data);
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.push(`/store/${params.storeId}/products`);
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

      <AdditionalInfoModal
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setCurrentSection(null);
        }}
        onAdd={handleAddSection}
        initialData={currentSection}
        index={infoIndex}
        remove={additionalInfoRemove}
      />

      <OptionModal
        isOpen={isOptionsDialogOpen}
        onClose={() => {
          setIsOptionsDialogOpen(false);
          setCurrentOption(null);
        }}
        onAdd={handleAddOrUpdateOption}
        initialData={currentOption}
        index={infoIndex}
        remove={removeOption}
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
            {/*Left grid */}
            <div className="col-span-2 space-y-8">
              {/* Product Info */}
              <Card className="space-y-8 shadow-none">
                <CardHeader>
                  <CardTitle>Product Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
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
                                ...field.value.filter(
                                  (current) => current.url !== url
                                ),
                              ])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <SimpleMDE {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <Separator />
                <CardFooter className="flex flex-col w-full items-start">
                  <CardHeader className="px-0">
                    <CardTitle>Additional Info Section</CardTitle>
                    <CardDescription
                      className={cn({
                        "text-xl": additionalInfoFields.length === 0,
                      })}
                    >
                      Share information like return policy or care instructions
                      with your customers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="w-full px-0">
                    {additionalInfoFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="w-full flex items-center mb-3"
                      >
                        <div
                          onClick={() => {
                            setInfoIndex(index);
                            setCurrentSection(field);
                            setIsDialogOpen(true);
                          }}
                          className="w-full grid grid-cols-3 gap-x-8 py-4 text-xl cursor-pointer hover:bg-slate-50"
                        >
                          <div className="max-w-48">
                            <h3 className="uppercase truncate">
                              {field.title}
                            </h3>
                          </div>
                          <div className="col-span-2">
                            <Markdown className="truncate prose text-lg">
                              {field.description}
                            </Markdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <Button
                    type="button"
                    className={cn("text-left text-lg my-9", {
                      "ml-0 px-0": additionalInfoFields.length > 0,
                    })}
                    variant={
                      additionalInfoFields.length === 0 ? "default" : "link"
                    }
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Info Section
                  </Button>
                </CardFooter>
              </Card>

              {/* Pricing card */}
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className=" space-y-8">
                  <div className=" max-w-xs">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <div className="relative mb-6">
                              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none font-bold">
                                NGN
                              </div>
                              <Input
                                type="number"
                                disabled={loading}
                                min={0}
                                placeholder="10"
                                className="!ps-16 font-medium"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="discount"
                      disabled={loading}
                      checked={isOnSale}
                      onCheckedChange={setIsOnSale}
                    />
                    <Label htmlFor="discount">On sale</Label>
                  </div>
                  <div
                    className={cn("grid-cols-2 gap-8 max-w-xl", {
                      grid: isOnSale,
                      hidden: !isOnSale,
                    })}
                  >
                    <FormField
                      control={form.control}
                      name="discount.value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount</FormLabel>
                          <FormControl>
                            <div className="relative mb-6">
                              <div className="absolute inset-y-0 end-0 flex items-center pe-1.5 px-1 font-bold border-l">
                                <FormField
                                  control={form.control}
                                  name="discount.type"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                          className="flex"
                                        >
                                          {discountOptions.map((option) => (
                                            <FormItem className="flex items-center space-y-0 p-1 last:pr-1 rounded-md">
                                              <FormControl>
                                                <RadioGroupItem
                                                  value={option.value}
                                                  className="hidden"
                                                />
                                              </FormControl>
                                              <FormLabel
                                                className={cn(
                                                  "font-medium cursor-pointer",
                                                  {
                                                    "bg-slate-800 text-white p-2 rounded-md":
                                                      field.value ===
                                                      option.value,
                                                  }
                                                )}
                                              >
                                                {option.label}
                                              </FormLabel>
                                            </FormItem>
                                          ))}
                                        </RadioGroup>
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <Input
                                type="number"
                                min={0}
                                disabled={loading}
                                placeholder="10"
                                className="!pe-36 font-medium"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Price</FormLabel>
                          <FormControl>
                            <div className="relative mb-6">
                              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none font-bold">
                                NGN
                              </div>
                              <Input
                                type="number"
                                disabled={loading}
                                min={0}
                                placeholder="10"
                                className="!ps-16 font-medium"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <FormField
                      control={form.control}
                      name="costProfit.itemCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost of goods</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
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
                      name="costProfit.profit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profit</FormLabel>
                          <FormControl>
                            <div className="relative mb-6">
                              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none font-bold">
                                NGN
                              </div>
                              <Input
                                type="number"
                                disabled
                                placeholder="10"
                                className="!ps-16 font-bold disabled:bg-slate-200"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="costProfit.profitMargin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Margin</FormLabel>
                          <FormControl>
                            <div className="relative mb-6">
                              <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none font-bold">
                                %
                              </div>
                              <Input
                                type="number"
                                disabled
                                placeholder="10"
                                className="!pe-10 font-bold disabled:bg-slate-200"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Options card */}
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Product options</CardTitle>
                  <CardDescription
                    className={cn({ "text-xl": optionFields.length === 0 })}
                  >
                    {optionFields.length > 0
                      ? "Manage the options this product comes in."
                      : "Does your product come in different options, like size, color or material? Add them here."}
                  </CardDescription>
                </CardHeader>
                {optionFields.map((field, index) => (
                  <>
                    <CardContent
                      className="w-full py-5 hover:bg-slate-50 cursor-pointer"
                      key={field.id}
                      onClick={() => {
                        setInfoIndex(index);
                        setCurrentOption(field);
                        setIsOptionsDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-full grid grid-cols-3 gap-x-8 text-lg">
                          <div className="max-w-48">
                            <h3 className="uppercase truncate">{field.name}</h3>
                          </div>
                          <div className="col-span-2">
                            <p className="truncate">
                              {field.values.map((v) => v.value).join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <Separator />
                  </>
                ))}
                <Button
                  type="button"
                  className={cn("text-left text-lg my-9", {
                    "ml-6": optionFields.length === 0,
                  })}
                  variant={optionFields.length === 0 ? "default" : "link"}
                  onClick={() => setIsOptionsDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Options
                </Button>
                {optionFields.length > 0 && (
                  <>
                    <Separator />
                    <FormField
                      control={form.control}
                      name="manageVariants"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center space-x-2 pl-6 py-9">
                              <Switch
                                disabled={loading}
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  setIsHidden(!checked);
                                }}
                              />
                              <FormLabel className="text-lg">
                                Manage pricing and inventory for each product
                                variant
                              </FormLabel>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </Card>

              {/* stock card */}
              {isHidden && (
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory and Shipping</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="stock.trackInventory"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center space-x-2 py-9">
                              <Switch
                                disabled={loading}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <FormLabel className="text-lg">
                                Track Inventory
                              </FormLabel>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-8">
                      {!form.getValues("stock.trackInventory") ? (
                        <InventoryStatusSelect />
                      ) : (
                        <FormField
                          control={form.control}
                          name="stock.quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inventory</FormLabel>
                              <FormControl>
                                <Input
                                  required
                                  type="number"
                                  disabled={loading}
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping weight(kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled={loading}
                                placeholder="0.00"
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
              )}

              {/* variant */}
              {!isHidden && (
                <>
                  <div className="flex items-center justify-between">
                    <Heading
                      title="Variants"
                      description="Manage product variants"
                    />
                    <div className="flex space-x-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="variant-tracking"
                          checked={isTracking}
                          onCheckedChange={setIsTracking}
                        />
                        <Label htmlFor="variant-tracking" className="text-base">
                          Track Inventory
                        </Label>
                      </div>
                      <Button
                        type="button"
                        onClick={handleVariant}
                        size={"sm"}
                        disabled={loading || optionFields.length === 0}
                      >
                        Generate Variants
                      </Button>
                    </div>
                  </div>
                  <Separator className="!mt-4" />
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <Label>Title</Label>
                    <Label>Price</Label>
                    <Label>Cost of goods</Label>
                    <Label>{!isTracking ? "Stock" : "Inventory"}</Label>
                  </div>
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`variants.${index}.title`}
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
                        name={`variants.${index}.price`}
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
                      <FormField
                        control={form.control}
                        name={`variants.${index}.costofgoods`}
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
                        {!isTracking ? (
                          <FormField
                            control={form.control}
                            name={`variants.${index}.status`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        defaultValue={field.value}
                                        placeholder="Select a status"
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {inventoryStatusOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <FormField
                            control={form.control}
                            name={`variants.${index}.inventory`}
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
                        )}
                        <Button
                          type="button"
                          disabled={loading}
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            {/* Right grid */}
            <div className="space-y-8">
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
                        disabled={loading}
                        checked={field.value}
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
              <Card className="!shadow-none">
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3">
                    {categories?.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="categories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  className="w-5 h-5"
                                  disabled={loading}
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value: string) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-medium text-base">
                                {item.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    className="text-left text-base p-0"
                    variant="link"
                    onClick={handleCreateCategory}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create Category
                  </Button>
                </CardFooter>
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

export default ProductForm;
