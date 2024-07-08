import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import CustomerClient from "./components/client";
import { CustomerColumn } from "./components/columns";

type CustomerProps = {
  params: { storeId: string };
};

const CustomerPage = async ({ params }: CustomerProps) => {
  const customers = await prismadb.customer.findMany({
    where: {
      stores: {
        some: {
          id: params.storeId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCustomers: CustomerColumn[] = customers.map((item) => ({
    id: item.id,
    email: item.email,
    name: `${item.firstName} ${item.lastName}`,
    phone: item.phone || "-",
    address: item.address || "-",
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CustomerClient data={formattedCustomers} />
      </div>
    </div>
  );
};

export default CustomerPage;
