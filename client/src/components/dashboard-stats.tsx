import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchFinancialSummaryReport } from "@/features/reports/reportSlice";
import type { RootState, AppDispatch } from "@/store";

export function DashboardStats() {
  const dispatch = useDispatch<AppDispatch>();
  const reportsState = useSelector((state: RootState) => state.reports);
  
  // Safe destructuring with fallbacks
  const {
    financialSummary = null,
    isLoading = false,
    error = null
  } = reportsState || {};

  useEffect(() => {
    // Fetch financial summary report for the last 30 days
    dispatch(fetchFinancialSummaryReport({}));
  }, [dispatch]);

  // Debug logging to see what we're getting from the API
  useEffect(() => {
    if (financialSummary) {
      //console.log('Financial Summary Data:', financialSummary);
    }
  }, [financialSummary]);

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <CardDescription className="h-4 bg-muted rounded w-24"></CardDescription>
              <CardTitle className="h-8 bg-muted rounded w-32"></CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Stats</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate growth rates (mock calculation for demonstration)
  const revenueGrowth = 12.5;
  const assetGrowth = 8.3;
  const profitGrowth = 15.2;

  // Safe getters with fallbacks from the new API structure
  const totalIncome = financialSummary?.totalIncome ?? 0;
  const totalExpenses = financialSummary?.totalExpenses ?? 0;
  const netProfit = financialSummary?.netProfit ?? 0;
  const totalAssets = financialSummary?.totalAssets ?? 0;
  const totalLiabilities = financialSummary?.totalLiabilities ?? 0;
  
  // Calculate derived metrics
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  const equity = totalAssets - totalLiabilities;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
              <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${totalIncome.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +{revenueGrowth}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Income trending up <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Based on recent financial data
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${totalAssets.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +{assetGrowth}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Strong asset base <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Assets minus liabilities: ${equity.toLocaleString()}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Net Profit</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${netProfit.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +{profitGrowth}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Strong profitability <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Profit margin: {profitMargin.toFixed(1)}%
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Liabilities</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${totalLiabilities.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingDown />
                -{assetGrowth}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Manageable debt level <IconTrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Total expenses: ${totalExpenses.toLocaleString()}
            </div>
          </CardFooter>
        </Card>
    </div>
  );
} 