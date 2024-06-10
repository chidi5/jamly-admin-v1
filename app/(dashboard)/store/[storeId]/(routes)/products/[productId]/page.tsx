import prismadb from "@/lib/prismadb";
import React from "react";
import dynamic from "next/dynamic";
import ProductForm from "./components/product-form";

/*const ProductForm = dynamic(
  () =>
    import(
      "@/app/(dashboard)/store/[storeId]/(routes)/products/[productId]/components/product-form"
    ),
  {
    ssr: false,
  }
);*/

const ProductPage = async ({
  params,
}: {
  params: { productId: string; storeId: string };
}) => {
  const store = await prismadb.store.findUnique({
    where: { id: params.storeId },
    select: { defaultCurrency: true },
  });

  if (!store) return null;

  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      priceData: true,
      stock: true,
      discount: true,
      additionalInfoSections: true,
      costAndProfitData: true,
      categories: true,
      options: {
        include: {
          values: true,
        },
      },
      variants: {
        include: {
          priceData: true,
          costAndProfitData: true,
          stock: true,
          selectedOptions: {
            include: {
              option: true,
            },
          },
        },
      },
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          currency={store.defaultCurrency}
          initialData={product}
        />
      </div>
    </div>
  );
};

export default ProductPage;
