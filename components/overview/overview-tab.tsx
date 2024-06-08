import React from "react";
import { TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Activity, CreditCard, DollarSign } from "lucide-react";
import { getAuthUserDetails, priceFormatter } from "@/lib/queries";

type OverviewTabProps = {
  data: string;
  totalRevenue: { currentMonthTotalRevenue: number; percentageChange: number };
  sales: { currentMonthSalesCount: number; percentageChange: number };
  stock: number;
};

const OverviewTab = async ({
  data,
  totalRevenue,
  sales,
  stock,
}: OverviewTabProps) => {
  const user = await getAuthUserDetails();
  if (!user) return null;

  const formatter = await priceFormatter(
    user.Store!.locale,
    user.Store!.defaultCurrency
  );
  return (
    <TabsContent value={data} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatter.format(totalRevenue.currentMonthTotalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue.percentageChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales.currentMonthSalesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {sales.percentageChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Products in Stock
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stock}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">{/*<Overview />*/}</CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>{/*<RecentSales />*/}</CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default OverviewTab;
