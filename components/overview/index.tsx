import {
  getCustomerCount,
  getSalesCount,
  getTotalRevenue,
  getTotalStock,
  recentSales,
} from "@/lib/queries";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import OverviewTab from "./overview-tab";

const Overview = async ({ storeId }: { storeId: string }) => {
  const totalRevenue = await getTotalRevenue(storeId);
  const sales = await getSalesCount(storeId);
  const stock = await getTotalStock(storeId);
  const customer = await getCustomerCount(storeId);
  const recentSale = await recentSales(storeId);
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics" disabled>
          Analytics
        </TabsTrigger>
        <TabsTrigger value="reports" disabled>
          Reports
        </TabsTrigger>
        <TabsTrigger value="notifications" disabled>
          Notifications
        </TabsTrigger>
      </TabsList>
      <OverviewTab
        data="overview"
        totalRevenue={totalRevenue}
        sales={sales}
        stock={stock}
        customer={customer}
        recentSales={recentSale}
        storeId={storeId}
      />
    </Tabs>
  );
};

export default Overview;
