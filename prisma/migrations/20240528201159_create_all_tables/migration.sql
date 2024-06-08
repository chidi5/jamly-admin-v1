-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STORE_OWNER', 'STAFF_USER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'PARTIALLY_OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('AMOUNT', 'PERCENT');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('ACCEPTED', 'REVOKED', 'PENDING');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('PLN_n9u9ypf43pk6vti', 'PLN_4elei0drizjfiie');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF_USER',
    "storeId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "connectAccountId" TEXT DEFAULT '',
    "customerId" TEXT DEFAULT '',
    "name" TEXT NOT NULL,
    "storeLogo" TEXT,
    "companyEmail" TEXT,
    "companyPhone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "state" TEXT,
    "country" TEXT,
    "defaultCurrency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Billboard" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isBanner" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Billboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL DEFAULT 'PHYSICAL',
    "description" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "manageVariants" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdditionalInfoSection" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" VARCHAR(16000) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "AdditionalInfoSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "OptionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceData" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION,
    "productId" TEXT,
    "variantId" TEXT,

    CONSTRAINT "PriceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostAndProfitData" (
    "id" TEXT NOT NULL,
    "itemCost" DOUBLE PRECISION NOT NULL,
    "formattedItemCost" TEXT NOT NULL,
    "profit" DOUBLE PRECISION,
    "formattedProfit" TEXT NOT NULL,
    "profitMargin" DOUBLE PRECISION,
    "productId" TEXT,
    "variantId" TEXT,

    CONSTRAINT "CostAndProfitData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "trackInventory" BOOLEAN NOT NULL,
    "quantity" INTEGER,
    "inventoryStatus" "InventoryStatus" NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "productId" TEXT,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "role" "Role" NOT NULL DEFAULT 'STAFF_USER',

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "notification" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "plan" "Plan",
    "price" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "priceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "currentPeriodEndDate" TIMESTAMP(3) NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "storeId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoriesOnProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_VariantOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_storeId_idx" ON "User"("storeId");

-- CreateIndex
CREATE INDEX "Billboard_storeId_idx" ON "Billboard"("storeId");

-- CreateIndex
CREATE INDEX "Category_storeId_idx" ON "Category"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_handle_key" ON "Category"("storeId", "handle");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_handle_key" ON "Product"("storeId", "handle");

-- CreateIndex
CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Variant_productId_idx" ON "Variant"("productId");

-- CreateIndex
CREATE INDEX "OptionValue_optionId_idx" ON "OptionValue"("optionId");

-- CreateIndex
CREATE INDEX "Image_productId_idx" ON "Image"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceData_productId_key" ON "PriceData"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceData_variantId_key" ON "PriceData"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "CostAndProfitData_productId_key" ON "CostAndProfitData"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CostAndProfitData_variantId_key" ON "CostAndProfitData"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_key" ON "Stock"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_variantId_key" ON "Stock"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_productId_key" ON "Discount"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_key" ON "Invitation"("email");

-- CreateIndex
CREATE INDEX "Invitation_storeId_idx" ON "Invitation"("storeId");

-- CreateIndex
CREATE INDEX "Notification_storeId_idx" ON "Notification"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionId_key" ON "Subscription"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_storeId_key" ON "Subscription"("storeId");

-- CreateIndex
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoriesOnProduct_AB_unique" ON "_CategoriesOnProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoriesOnProduct_B_index" ON "_CategoriesOnProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_VariantOptions_AB_unique" ON "_VariantOptions"("A", "B");

-- CreateIndex
CREATE INDEX "_VariantOptions_B_index" ON "_VariantOptions"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billboard" ADD CONSTRAINT "Billboard_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdditionalInfoSection" ADD CONSTRAINT "AdditionalInfoSection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionValue" ADD CONSTRAINT "OptionValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceData" ADD CONSTRAINT "PriceData_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceData" ADD CONSTRAINT "PriceData_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostAndProfitData" ADD CONSTRAINT "CostAndProfitData_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostAndProfitData" ADD CONSTRAINT "CostAndProfitData_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesOnProduct" ADD CONSTRAINT "_CategoriesOnProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesOnProduct" ADD CONSTRAINT "_CategoriesOnProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VariantOptions" ADD CONSTRAINT "_VariantOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "OptionValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VariantOptions" ADD CONSTRAINT "_VariantOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
