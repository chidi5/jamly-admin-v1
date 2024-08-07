import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import OrderClient from "./components/client";
import { OrderColumn } from "./components/columns";
import { priceFormatter } from "@/lib/queries";
import { getAuthUserDetails } from "@/lib/queries/user";

type OrderProps = {
  params: { storeId: string };
};

const OrderPage = async ({ params }: OrderProps) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              priceData: true,
              variants: {
                include: {
                  priceData: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const user = await getAuthUserDetails();

  if (!user) return null;

  const selectedStore = user.stores.find(
    (store) => store.id === params.storeId
  );
  if (!selectedStore) return null;

  const formatter = await priceFormatter(
    selectedStore.locale,
    selectedStore.defaultCurrency
  );

  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    products: item.orderItems
      .map((orderItem) => orderItem.product.name)
      .join(", "),
    totalPrice: formatter.format(
      item.orderItems.reduce(
        (total, orderItem) =>
          total + orderItem.price.toNumber() * orderItem.quantity!,
        0
      )
    ),
    status: item.status,
    isPaid: item.isPaid,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrderPage;
