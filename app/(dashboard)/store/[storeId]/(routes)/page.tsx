import WidthWrapper from "@/components/WidthWrapper";
import Overview from "@/components/overview";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getSalesCount, getTotalRevenue, getTotalStock } from "@/lib/queries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Store Dashboard.",
};

const DashboardPage = async ({ params }: { params: { storeId: string } }) => {
  const totalRevenue = await getTotalRevenue(params.storeId);
  const sales = await getSalesCount(params.storeId);
  const totalStock = await getTotalStock(params.storeId);
  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Heading title="Dashboard" description="Your store overview" />
          <div className="flex items-center space-x-2">
            {/*<CalendarDateRangePicker />*/}
          </div>
        </div>
        <Separator />

        <Overview
          totalRevenue={totalRevenue}
          sales={sales}
          stock={totalStock}
        />
      </div>
    </>
  );
};

export default DashboardPage;
