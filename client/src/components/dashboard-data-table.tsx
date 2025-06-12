import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { fetchQuotes } from "@/features/quotes/quoteSlice";
import { fetchInvoices } from "@/features/invoices/invoiceSlice";
import { fetchProducts } from "@/features/products/productSlice";
import type { RootState, AppDispatch } from "@/store";

export function DashboardDataTable() {
  const dispatch = useDispatch<AppDispatch>();
  
  const { 
    quotes, 
    isLoading: quotesLoading 
  } = useSelector((state: RootState) => state.quotes);
  
  const { 
    invoices, 
    isLoading: invoicesLoading 
  } = useSelector((state: RootState) => state.invoices);
  
  const { 
    products, 
    isLoading: productsLoading 
  } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    // Fetch recent data (limit to 5 items each)
    dispatch(fetchQuotes({ page: 1, limit: 5 }));
    dispatch(fetchInvoices({ page: 1, limit: 5 }));
    dispatch(fetchProducts({ page: 1, limit: 5 }));
  }, [dispatch]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'issued':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'sent':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'expired':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quotes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quotes" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotesLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Loading quotes...
                        </TableCell>
                      </TableRow>
                    ) : quotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No quotes found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      quotes.slice(0, 5).map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">
                            {quote?.customer?.name || 'Unknown Customer'}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(quote?.totalEstimate || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(quote?.status || 'draft')}>
                              {quote?.status || 'DRAFT'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {quote?.expiresAt ? formatDate(quote.expiresAt) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="invoices" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Loading invoices...
                        </TableCell>
                      </TableRow>
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No invoices found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.slice(0, 5).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            #{invoice?.id?.slice(-8) || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {invoice?.customer?.name || 'Unknown Customer'}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(invoice?.totalAmount || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(invoice?.status || 'draft')}>
                              {invoice?.status || 'DRAFT'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {invoice?.createdAt ? formatDate(invoice.createdAt) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Loading products...
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.slice(0, 5).map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product?.name || 'Unknown Product'}
                          </TableCell>
                          <TableCell>
                            {product?.sku || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(product?.defaultPrice || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 