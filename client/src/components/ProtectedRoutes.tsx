import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardPage } from '@/pages/DashboardPage';
import { QuotationsPage } from '@/pages/QuotationsPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ExpensePage } from '@/pages/ExpensePage';
import { CustomersPage } from '@/pages/CustomersPage';  
import { ProductsPage } from '@/pages/ProductsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { QuoteDetailsPage } from '@/features/quotes/pages/QuoteDetailsPage';
import { QuoteEditPage } from '@/features/quotes/pages/QuoteEditPage';
import { NewQuotePage } from '@/features/quotes/pages/NewQuotePage';
import { OrderDetailsPage } from '@/features/orders/pages/OrderDetailsPage';
import { OrderEditPage } from '@/features/orders/pages/OrderEditPage';
import { NewOrderPage } from '@/features/orders/pages/NewOrderPage';
import { NewOrderFromQuotePage } from '@/features/orders/pages/NewOrderFromQuotePage';
import { InvoiceDetailsPage } from '@/features/invoices/pages/InvoiceDetailsPage';
import { NewInvoicePage } from '@/features/invoices/pages/NewInvoicePage';
import { InvoiceEditPage } from '@/features/invoices/pages/InvoiceEditPage';
import { NewCustomerPage } from '@/features/customers/pages/NewCustomerPage';
import { EditCustomerPage } from '@/features/customers/pages/EditCustomerPage';
import { BusinessAddressesPage } from '@/pages/BusinessAddressesPage';
import { NewBusinessAddressPage } from '@/features/business-addresses/pages/NewBusinessAddressPage';
import { EditBusinessAddressPage } from '@/features/business-addresses/pages/EditBusinessAddressPage';
import { NewProductPage } from '@/features/products/pages/NewProductPage';
import { EditProductPage } from '@/features/products/pages/EditProductPage';
import { TaxPage } from '@/pages/TaxPage';
import { NewTaxPage } from '@/features/tax/pages/NewTaxPage';
import { EditTaxPage } from '@/features/tax/pages/EditTaxPage';
import { PaymentTypesPage } from '@/pages/PaymentTypesPage';
import { NewPaymentTypePage } from '@/features/payment-types/pages/NewPaymentTypePage';
import { EditPaymentTypePage } from '@/features/payment-types/pages/EditPaymentTypePage';
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";

export function ProtectedRoutes() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/quotations" element={
            <ProtectedRoute>
              <QuotationsPage />
            </ProtectedRoute>
          } />
          <Route path="/quotations/:id" element={
            <ProtectedRoute>
              <QuoteDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/quotations/:id/edit" element={
            <ProtectedRoute>
              <QuoteEditPage />
            </ProtectedRoute>
          } />
          <Route path="/quotations/new" element={
            <ProtectedRoute>
              <NewQuotePage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id/edit" element={
            <ProtectedRoute>
              <OrderEditPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/new" element={
            <ProtectedRoute>
              <NewOrderPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/from-quote/:quoteId" element={
            <ProtectedRoute>
              <NewOrderFromQuotePage />
            </ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute>
              <InvoicesPage />
            </ProtectedRoute>
          } />
          <Route path="/invoices/:id" element={
            <ProtectedRoute>
              <InvoiceDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/invoices/:id/edit" element={
            <ProtectedRoute>
              <InvoiceEditPage />
            </ProtectedRoute>
          } />
          <Route path="/invoices/new" element={
            <ProtectedRoute>
              <NewInvoicePage />
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          } />
          <Route path="/expense" element={
            <ProtectedRoute>
              <ExpensePage />
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/customers/new" element={
            <ProtectedRoute>
              <NewCustomerPage />
            </ProtectedRoute>
          } />
          <Route path="/customers/:id/edit" element={
            <ProtectedRoute>
              <EditCustomerPage />
            </ProtectedRoute>
          } />
          <Route path="/business-addresses" element={
            <ProtectedRoute>
              <BusinessAddressesPage />
            </ProtectedRoute>
          } />
          <Route path="/business-addresses/new" element={
            <ProtectedRoute>
              <NewBusinessAddressPage />
            </ProtectedRoute>
          } />
          <Route path="/business-addresses/:id/edit" element={
            <ProtectedRoute>
              <EditBusinessAddressPage />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          } />
          <Route path="/products/new" element={
            <ProtectedRoute>
              <NewProductPage />
            </ProtectedRoute>
          } />
          <Route path="/products/:id/edit" element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          } />
          <Route path="/tax" element={
            <ProtectedRoute>
              <TaxPage />
            </ProtectedRoute>
          } />
          <Route path="/tax/new" element={
            <ProtectedRoute>
              <NewTaxPage />
            </ProtectedRoute>
          } />
          <Route path="/tax/:id/edit" element={
            <ProtectedRoute>
              <EditTaxPage />
            </ProtectedRoute>
          } />
          <Route path="/payment-types" element={
            <ProtectedRoute>
              <PaymentTypesPage />
            </ProtectedRoute>
          } />
          <Route path="/payment-types/new" element={
            <ProtectedRoute>
              <NewPaymentTypePage />
            </ProtectedRoute>
          } />
          <Route path="/payment-types/:id/edit" element={
            <ProtectedRoute>
              <EditPaymentTypePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route index element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  );
} 