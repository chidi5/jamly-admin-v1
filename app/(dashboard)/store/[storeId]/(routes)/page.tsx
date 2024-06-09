import Overview from "@/components/overview";
import StoreFrontButton from "@/components/store-front-button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Store Dashboard.",
};

const DashboardPage = ({ params }: { params: { storeId: string } }) => {
  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Heading title="Dashboard" description="Your store overview" />
          <div className="flex items-center space-x-2">
            {/*<CalendarDateRangePicker />*/}
            <StoreFrontButton storeId={params.storeId} />
          </div>
        </div>
        <Separator />

        <Overview storeId={params.storeId} />
      </div>
    </>
  );
};

export default DashboardPage;
