import prismadb from "@/lib/prismadb";
import React from "react";
import DomainForm from "./components/domain-form";

const DomainPage = async ({ params }: { params: { domainId: string } }) => {
  const domain = await prismadb.domain.findUnique({
    where: {
      id: params.domainId,
    },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <DomainForm initialData={domain} />
      </div>
    </div>
  );
};

export default DomainPage;
