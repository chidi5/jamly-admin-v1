import { z } from "zod";

export const AdditionalInfoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required").max(65535),
});

export const stockSchema = z.object({
  trackInventory: z.boolean().default(false),
  quantity: z.coerce.number().positive("Quantity must be positive").optional(),
  inventoryStatus: z
    .enum(["IN_STOCK", "OUT_OF_STOCK", "PARTIALLY_OUT_OF_STOCK"])
    .optional(),
});

export const discountSchema = z.object({
  value: z.coerce.number().min(0).optional(),
  type: z.enum(["AMOUNT", "PERCENT"]).optional(),
});

export const priceDataSchema = z.object({
  currency: z.string().min(1),
  price: z.coerce.number().min(0),
  discountedPrice: z.coerce.number().min(0).nullable().optional(),
});

export const CostAndProfitDataSchema = z.object({
  itemCost: z.coerce.number().min(0).optional(),
  profit: z.coerce.number().min(0).optional(),
  profitMargin: z.coerce.number().min(0).optional(),
});

export const optionValueSchema = z.object({
  value: z.string().min(1),
});

export const optionSchema = z.object({
  name: z.string().min(1),
  values: z.array(optionValueSchema),
});

export const variantSchema = z.object({
  title: z.string().min(1),
  price: z.coerce.number().positive("Price must be positive"),
  costofgoods: z.coerce.number().positive("Price must be positive").optional(),
  inventory: z.coerce.number().optional(),
  status: z
    .enum(["IN_STOCK", "OUT_OF_STOCK", "PARTIALLY_OUT_OF_STOCK"])
    .optional(),
});

export const productFormSchema = z.object({
  name: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  discountedPrice: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().optional(),
  description: z.string().min(1, "Description is required").max(65535),
  categories: z.array(z.string().uuid()).optional(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  manageVariants: z.boolean().default(false).optional(),
  variants: z.array(variantSchema).optional(),
  options: z.array(optionSchema).optional(),
  additionalInfoSections: z.array(AdditionalInfoSchema).optional(),
  stock: stockSchema.optional(),
  costProfit: CostAndProfitDataSchema.optional(),
  discount: discountSchema.optional(),
});
