"use client";

import { OrderDetailColumn, columns } from "./columns";
import { DataTable } from "./data-table";

type OrderClientProps = {
  data: OrderDetailColumn[];
  total: string;
};

const OrderDetailClient = ({ data, total }: OrderClientProps) => {
  return (
    <DataTable columns={columns} data={data} shipping="0.00" total={total} />
  );
};

export default OrderDetailClient;
