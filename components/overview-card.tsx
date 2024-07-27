import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type OverviewTabCardProps = {
  headerLabel: string;
  cardFigure: string | number;
  percentageChange?: string | number;
  showPercentageChange?: boolean;
  Icon: LucideIcon;
};

const OverviewTabCard = ({
  headerLabel,
  cardFigure,
  percentageChange,
  showPercentageChange,
  Icon,
}: OverviewTabCardProps) => {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{headerLabel}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{cardFigure}</div>
        {showPercentageChange && (
          <p className="text-xs text-muted-foreground">{percentageChange}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default OverviewTabCard;
