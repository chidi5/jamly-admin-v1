"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import DomainClient from "./components/client";
import { DomainColumn } from "./components/columns";
import Loading from "../loading";

type DomainProps = {
  params: { storeId: string };
};

const DomainPage = ({ params }: DomainProps) => {
  const [domains, setDomains] = useState<DomainColumn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDomains = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/domains`);
      const formattedDomains: DomainColumn[] = response.data.map(
        (item: any) => ({
          id: item.id,
          domain: item.domain,
          status: item.verificationStatus,
        })
      );
      setDomains(formattedDomains);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch domains:", error);
    }
  };

  useEffect(() => {
    fetchDomains(); // Initial fetch
    const interval = setInterval(fetchDomains, 60000); // Fetch every 60 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [params.storeId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DomainClient data={domains} fetchDomains={fetchDomains} />
      </div>
    </div>
  );
};

export default DomainPage;

// Opt out of caching for all data requests in the route segment
export const dynamic = "force-dynamic";
