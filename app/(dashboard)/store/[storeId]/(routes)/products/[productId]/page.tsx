import prismadb from "@/lib/prismadb";
import React from "react";
import dynamic from "next/dynamic";

const ProductForm = dynamic(
  () =>
    import(
      "@/app/(dashboard)/store/[storeId]/(routes)/products/[productId]/components/product-form"
    ),
  {
    ssr: false,
  }
);

const ProductPage = async ({
  params,
}: {
  params: { productId: string; storeId: string };
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      variants: {
        include: {
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
      <div className="flex-1 space-y-4">
        <ProductForm categories={categories} initialData={product} />
      </div>
    </div>
  );
};

export default ProductPage;
