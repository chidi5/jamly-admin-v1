import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import CategoryClient from "./components/client";
import { CategoryColumn } from "./components/columns";

type CategoryProps = {
  params: { storeId: string };
};

const CategoriesPage = async ({ params }: CategoryProps) => {
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    handle: item.handle,
    isFeatured: item.isFeatured,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;
