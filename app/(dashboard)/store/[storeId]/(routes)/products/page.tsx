import prismadb from "@/lib/prismadb";
import { priceFormatter } from "@/lib/queries";
import { format } from "date-fns";
import ProductClient from "./components/client";
import { ProductColumn } from "./components/columns";
import { getAuthUserDetails } from "@/lib/queries/user";

type ProductProps = {
  params: { storeId: string };
};

const ProductPage = async ({ params }: ProductProps) => {
  const user = await getAuthUserDetails();

  if (!user) return null;

  const formatter = await priceFormatter(
    user.Store!.locale,
    user.Store!.defaultCurrency
  );

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      categories: true,
      priceData: true,
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    variants: item.variants.length,
    price: formatter.format(item.priceData!.price),
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductPage;
