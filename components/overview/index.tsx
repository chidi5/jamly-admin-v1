import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import OverviewTab from "./overview-tab";

type OverviewProps = {
  totalRevenue: number;
  sales: number;
  stock: number;
};

const Overview = ({ totalRevenue, sales, stock }: OverviewProps) => {
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
      />
    </Tabs>
  );
};

export default Overview;
