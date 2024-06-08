import prismadb from "@/lib/prismadb";
import CategoryForm from "./components/category-form";

const CategoryPage = async ({
  params,
}: {
  params: { categoryId: string; storeId: string };
}) => {
  const category = await prismadb.category.findUnique({
    where: {
      id: params.categoryId,
    },
    include: {
      products: {
        include: {
          images: true,
        },
      },
    },
  });
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      images: true,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm products={products} initialData={category} />
      </div>
    </div>
  );
};

export default CategoryPage;
