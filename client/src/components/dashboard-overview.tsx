import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  IconFileText, 
  IconUsers, 
  IconReceipt, 
  IconPackage,
  IconChevronRight 
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardChart } from "@/components/dashboard-chart";
import { fetchMonthlyStats } from "@/features/reports/reportSlice";
import type { RootState, AppDispatch } from "@/store";

export function DashboardOverview() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const reportsState = useSelector((state: RootState) => state.reports);
  
  const {
    monthlyStats = null,
    isLoading = false,
    error = null
  } = reportsState || {};

  useEffect(() => {
    dispatch(fetchMonthlyStats());
  }, [dispatch]);

  // Shortcuts configuration
  const shortcuts = [
    {
      title: "Create Orders",
      icon: IconReceipt,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
      path: "/orders/new"
    },
    {
      title: "Create Invoice",
      icon: IconFileText,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
      path: "/invoices/new"
    },
    {
      title: "Create Customers",
      icon: IconUsers,
      color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
      path: "/customers/new"
    },
    {
      title: "Create Product",
      icon: IconPackage,
      color: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
      path: "/products/new"
    }
  ];

  const totalRevenue = monthlyStats?.months?.reduce((sum, month) => sum + month.totalRevenue, 0) || 0;
  const totalInvoices = monthlyStats?.months?.reduce((sum, month) => sum + month.totalInvoices, 0) || 0;
  const totalCustomers = monthlyStats?.months?.reduce((sum, month) => sum + month.totalCustomers, 0) || 0;
  const totalProducts = monthlyStats?.months?.reduce((sum, month) => sum + month.totalProductsSold, 0) || 0;

  const handleShortcutClick = (path: string) => {
    navigate(path);
  };

  // Prepare chart data
  const revenueData = monthlyStats?.months?.map(month => ({
    date: month.month,
    value: month.totalRevenue
  })) || [];

  const invoiceData = monthlyStats?.months?.slice(-2).map(month => ({
    date: month.month,
    value: month.totalInvoices
  })) || [];

  const customerData = monthlyStats?.months?.slice(-2).map(month => ({
    date: month.month,
    value: month.totalCustomers
  })) || [];

  const productData = monthlyStats?.months?.slice(-2).map(month => ({
    date: month.month,
    value: month.totalProductsSold
  })) || [];

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Main Revenue Chart */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 border-0">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground">Total Revenue</CardDescription>
          <CardTitle className="text-4xl font-bold">
            ${totalRevenue.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {!isLoading && revenueData.length > 0 ? (
            <DashboardChart
              data={revenueData}
              dataKey="revenue"
              color="#3b82f6"
              height="h-[220px]"
              showGrid={true}
              showXAxis={true}
              formatValue={(value) => `$${value.toLocaleString()}`}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              {isLoading ? (
                <div className="text-muted-foreground">Loading chart...</div>
              ) : (
                <div className="text-muted-foreground">No data available</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Button
                  key={shortcut.title}
                  variant="ghost"
                  onClick={() => handleShortcutClick(shortcut.path)}
                  className="w-full justify-between h-auto p-3 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shortcut.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{shortcut.title}</span>
                  </div>
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Invoices</CardDescription>
            <CardTitle className="text-2xl">{totalInvoices.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {!isLoading && invoiceData.length > 0 ? (
              <DashboardChart
                data={invoiceData}
                dataKey="invoices"
                color="#8b5cf6"
                height="h-[180px]"
                showXAxis={true}
                formatValue={(value) => value.toLocaleString()}
              />
            ) : (
              <div className="h-[180px] flex items-center justify-center">
                {isLoading ? (
                  <div className="text-muted-foreground text-sm">Loading...</div>
                ) : (
                  <div className="text-muted-foreground text-sm">No data</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customers</CardDescription>
            <CardTitle className="text-2xl">{totalCustomers}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {!isLoading && customerData.length > 0 ? (
              <DashboardChart
                data={customerData}
                dataKey="customers"
                color="#10b981"
                height="h-[180px]"
                showXAxis={true}
                formatValue={(value) => value.toLocaleString()}
              />
            ) : (
              <div className="h-[180px] flex items-center justify-center">
                {isLoading ? (
                  <div className="text-muted-foreground text-sm">Loading...</div>
                ) : (
                  <div className="text-muted-foreground text-sm">No data</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Products Sold</CardDescription>
            <CardTitle className="text-2xl">{totalProducts.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {!isLoading && productData.length > 0 ? (
              <DashboardChart
                data={productData}
                dataKey="products"
                color="#f59e0b"
                height="h-[180px]"
                showXAxis={true}
                formatValue={(value) => value.toLocaleString()}
              />
            ) : (
              <div className="h-[180px] flex items-center justify-center">
                {isLoading ? (
                  <div className="text-muted-foreground text-sm">Loading...</div>
                ) : (
                  <div className="text-muted-foreground text-sm">No data</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 