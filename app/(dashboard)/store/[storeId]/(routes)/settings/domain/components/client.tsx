"use client";

import { ApiList } from "@/components/ui/api-list";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DomainColumn, columns } from "./columns";

type DomainClientProps = {
  data: DomainColumn[];
  fetchDomains: () => void;
};

const DomainClient = ({ data, fetchDomains }: DomainClientProps) => {
  const params = useParams();
  const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Domain"
          description="Boost your online presence and site's visibility with a custom domain
"
        />
        <Button
          onClick={() =>
            router.push(`/store/${params.storeId}/settings/domain/new`)
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Domain
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="domain"
        columns={columns(fetchDomains)}
        data={data}
        type="domain"
      />
    </>
  );
};

export default DomainClient;
