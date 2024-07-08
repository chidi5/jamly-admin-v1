"use client";

import { ApiList } from "@/components/ui/api-list";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CustomerColumn, columns } from "./columns";

type CustomerClientProps = {
  data: CustomerColumn[];
};

const CustomerClient = ({ data }: CustomerClientProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Customers (${data.length})`}
          description="Manage your store customers"
        />
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns}
        data={data}
        type="customer"
      />
      <Heading title="API" description="API Calls for Customers" />
      <Separator />
      <ApiList entityName="customers" entityIdName="customerId" />
    </>
  );
};

export default CustomerClient;
