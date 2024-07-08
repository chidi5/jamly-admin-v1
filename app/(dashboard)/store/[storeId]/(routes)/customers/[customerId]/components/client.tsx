"use client";

import { DataTable } from "@/components/ui/data-table";
import { CustomerDetailColumn, columns } from "./columns";

type CustomerClientProps = {
  data: CustomerDetailColumn[];
};

const CustomerDetailClient = ({ data }: CustomerClientProps) => {
  return (
    <DataTable
      searchKey="order"
      columns={columns}
      data={data}
      type="customer"
    />
  );
};

export default CustomerDetailClient;
