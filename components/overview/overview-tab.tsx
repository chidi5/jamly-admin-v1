import React from "react";
import { TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Activity, CreditCard, DollarSign, User } from "lucide-react";
import { priceFormatter } from "@/lib/queries";
import { getAuthUserDetails } from "@/lib/queries/user";
import OverviewTabCard from "../overview-card";
import RecentSales from "../recent-sales";

type OverviewTabProps = {
  data: string;
  totalRevenue: { currentMonthTotalRevenue: number; percentageChange: number };
  sales: { currentMonthSalesCount: number; percentageChange: number };
  stock: number;
  customer: number;
  recentSales: {
    productName: string;
    productImage: string;
    totalAmountPaid: number;
    quantity: number;
  }[];
  storeId: string;
};

const OverviewTab = async ({
  data,
  totalRevenue,
  sales,
  stock,
  customer,
  recentSales,
  storeId,
}: OverviewTabProps) => {
  const user = await getAuthUserDetails();

  if (!user) return null;

  const selectedStore = user.stores.find((store) => store.id === storeId);
  if (!selectedStore) return null;

  const formatter = await priceFormatter(
    selectedStore.locale,
    selectedStore.defaultCurrency
  );

  // Revenue
  const formattedtotalRevenue = formatter.format(
    totalRevenue.currentMonthTotalRevenue
  );
  const revenuePercentChange = `${totalRevenue.percentageChange.toFixed(
    1
  )}% from last month`;

  //Sales
  const salesCount = sales.currentMonthSalesCount;
  const salesPercentChange = `${sales.percentageChange.toFixed(
    1
  )}% from last month`;

  return (
    <TabsContent value={data} className="space-y-4">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <OverviewTabCard
          headerLabel={"Total Revenue"}
          cardFigure={formattedtotalRevenue}
          percentageChange={revenuePercentChange}
          showPercentageChange={true}
          Icon={DollarSign}
        />
        <OverviewTabCard
          headerLabel={"Sales"}
          cardFigure={salesCount}
          percentageChange={salesPercentChange}
          showPercentageChange={true}
          Icon={CreditCard}
        />
        <OverviewTabCard
          headerLabel={"Customers"}
          cardFigure={customer}
          Icon={User}
        />
        <OverviewTabCard
          headerLabel={"Products in Stock"}
          cardFigure={stock}
          Icon={Activity}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-none">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">{/*<Overview />*/}</CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3 shadow-none">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              {recentSales.length > 0
                ? `You made ${recentSales.length} sales in the past 30 days`
                : "No sales currently"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales data={recentSales} />
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default OverviewTab;
