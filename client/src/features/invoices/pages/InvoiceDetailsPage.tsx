import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { IconPrinter, IconArrowLeft, IconPencil, IconDownload, IconSend, IconCheck } from '@tabler/icons-react';

import { fetchInvoiceById, issueInvoice, markInvoiceAsPaid } from '../invoiceSlice';
import { fetchBusinessAddresses, fetchBusinessAddressById } from '../../business-addresses/businessAddressSlice';
import { getUserProfile } from '../../settings/settingsSlice';
import { type RootState, type AppDispatch } from '../../../store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentInvoice, isLoading, error } = useSelector((state: RootState) => state.invoices);
  const { businessAddresses, currentBusinessAddress } = useSelector((state: RootState) => state.businessAddresses);
  const { user } = useSelector((state: RootState) => state.auth);
  const { userProfile } = useSelector((state: RootState) => state.settings);
  const printRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchInvoiceById(id));
    }
    dispatch(fetchBusinessAddresses({ page: 1, limit: 100 }));
    dispatch(getUserProfile());
  }, [dispatch, id]);

  // Fetch customer business address when invoice is loaded
  useEffect(() => {
    if (currentInvoice?.customer?.businessAddressId) {
      dispatch(fetchBusinessAddressById(currentInvoice.customer.businessAddressId));
    }
  }, [dispatch, currentInvoice?.customer?.businessAddressId]);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact;
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
        }
        .invoice-print-content {
          width: 100% !important;
          height: auto !important;
          max-height: none !important;
          padding: 0 !important;
          margin: 0 !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
          overflow: visible !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
      }
    `
  });
  
  const handleDownloadPDF = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice #${currentInvoice?.id}</title>
              <style>
                @page {
                  size: A4;
                  margin: 15mm;
                }
                * {
                  box-sizing: border-box;
                }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  color: #333;
                  line-height: 1.4;
                  font-size: 12px;
                  -webkit-print-color-adjust: exact;
                }
                .invoice-print-content { 
                  width: 100%;
                  height: auto;
                  background: white;
                  padding: 24px;
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.5;
                  font-family: Arial, sans-serif;
                  color: #333;
                }
                h1 { 
                  font-size: 48px; 
                  font-weight: bold; 
                  color: #111827; 
                  margin-bottom: 8px;
                  margin-top: 0;
                }
                h3 { 
                  font-size: 18px; 
                  font-weight: 600; 
                  color: #111827; 
                  margin-bottom: 12px;
                  margin-top: 0;
                }
                .header { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: flex-start; 
                  margin-bottom: 32px;
                }
                .header-right {
                  text-align: right;
                }
                .badge { 
                  padding: 6px 12px; 
                  border: 1px solid #ddd; 
                  border-radius: 4px; 
                  font-size: 14px;
                  background: #f5f5f5;
                  display: inline-block;
                }
                .grid { 
                  display: grid; 
                }
                .grid-cols-2 { 
                  grid-template-columns: repeat(2, minmax(0, 1fr)); 
                }
                .gap-8 { 
                  gap: 32px; 
                }
                .separator { 
                  border-top: 1px solid #e5e7eb; 
                  margin: 24px 0; 
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 24px 0;
                  border: 1px solid #ddd;
                  font-size: 14px;
                }
                th, td { 
                  padding: 12px; 
                  text-align: left; 
                  border: 1px solid #ddd; 
                  vertical-align: top;
                }
                th { 
                  background-color: #f8f9fa; 
                  font-weight: bold; 
                  font-size: 14px;
                }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .font-semibold { font-weight: 600; }
                .font-medium { font-weight: 500; }
                .text-lg { font-size: 18px; }
                .text-sm { font-size: 12px; }
                .text-gray-600 { color: #6b7280; }
                .text-gray-900 { color: #111827; }
                .space-y-1 > * + * { margin-top: 4px; }
                .space-y-2 > * + * { margin-top: 8px; }
                .space-y-8 > * + * { margin-top: 32px; }
                .mb-3 { margin-bottom: 12px; }
                .mb-8 { margin-bottom: 32px; }
                .mt-1 { margin-top: 4px; }
                .mt-2 { margin-top: 8px; }
                .mt-8 { margin-top: 32px; }
                .totals-section {
                  display: flex;
                  justify-content: flex-end;
                  margin: 24px 0;
                }
                .totals-box {
                  width: 256px;
                }
                .totals-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                  font-size: 14px;
                }
                .totals-separator {
                  border-top: 1px solid #ddd;
                  margin: 8px 0;
                }
                .totals-total {
                  font-size: 18px;
                  font-weight: bold;
                }
                .terms {
                  margin-top: 32px;
                }
                .terms h3 {
                  margin-bottom: 12px;
                }
                .terms-list {
                  font-size: 14px;
                  color: #6b7280;
                }
                .terms-list > * + * {
                  margin-top: 4px;
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleIssueInvoice = () => {
    if (id) {
      dispatch(issueInvoice(id));
    }
  };

  const handleMarkAsPaid = () => {
    if (id) {
      dispatch(markInvoiceAsPaid(id));
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'outline';
      case 'ISSUED':
        return 'secondary';
      case 'PAID':
        return 'default';
      default:
        return 'outline';
    }
  };
  
  const calculateInvoiceTotals = () => {
    const items = currentInvoice?.order?.orderCarts || [];
    if (items.length === 0) return { subtotal: 0, totalTax: 0, total: 0 };
    
    const subtotal = items.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
    
    const totalTax = items.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      const taxRate = Number(item.taxRate) || 0;
      return sum + (quantity * unitPrice * (taxRate / 100));
    }, 0);
    
    const total = subtotal + totalTax;
    
    return { subtotal, totalTax, total };
  };
  
  const { subtotal, totalTax, total } = calculateInvoiceTotals();
  
  // Get primary business address
  const primaryBusinessAddress = businessAddresses.find(ba => ba.id) || businessAddresses[0];
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => navigate('/invoices')} className="mt-4">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  if (!currentInvoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>Invoice not found</p>
        <Button variant="outline" onClick={() => navigate('/invoices')} className="mt-4">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate(`/invoices/${id}/edit`)}>
            <IconPencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          {currentInvoice.status === 'DRAFT' && (
            <Button variant="outline" onClick={handleIssueInvoice}>
              <IconSend className="mr-2 h-4 w-4" /> Issue Invoice
            </Button>
          )}
          {currentInvoice.status === 'ISSUED' && (
            <Button variant="outline" onClick={handleMarkAsPaid}>
              <IconCheck className="mr-2 h-4 w-4" /> Mark as Paid
            </Button>
          )}
          <Button variant="outline" onClick={handleDownloadPDF}>
            <IconDownload className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={handlePrint}>
            <IconPrinter className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        {/* Main Invoice Content */}
        <div className="col-span-3">
          <div ref={printRef} className="invoice-print-content bg-white border border-gray-200 rounded-lg shadow-sm" style={{ 
            width: '100%', 
            minHeight: 'auto',
            padding: '24px',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'Arial, sans-serif',
            color: '#333'
          }}>
            <div className="header flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice</h1>
                <p className="text-gray-600 text-base">#{currentInvoice.id}</p>
              </div>
              <div className="header-right text-right">
                <Badge variant={getStatusBadgeVariant(currentInvoice.status)} className="text-sm px-3 py-1">
                  {currentInvoice.status}
                </Badge>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Date: {format(new Date(currentInvoice.createdAt), 'MMM dd, yyyy')}</p>
                  <p>Language: {currentInvoice.language?.toUpperCase() || 'EN'}</p>
                  <p>Template: {currentInvoice.governmentTemplate || 'Standard'}</p>
                </div>
              </div>
            </div>
            
            <div className="separator border-t border-gray-200 mb-6" />
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">From</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {userProfile?.businessName || userProfile?.name || user?.businessName || user?.name || 'Your Company Name'}
                  </p>
                  {(userProfile?.businessRegistrationNumber || user?.businessRegistrationNumber) && (
                    <p className="text-sm">
                      Registration: {userProfile?.businessRegistrationNumber || user?.businessRegistrationNumber}
                    </p>
                  )}
                  <p>{userProfile?.email || user?.email || 'Your Email'}</p>
                  {(userProfile?.phone || user?.phone) && (
                    <p>{userProfile?.phone || user?.phone}</p>
                  )}
                  {primaryBusinessAddress ? (
                    <>
                      <p>{primaryBusinessAddress.address}</p>
                      <p>{primaryBusinessAddress.street} {primaryBusinessAddress.houseNumber}</p>
                      <p>{primaryBusinessAddress.state}, {primaryBusinessAddress.country}</p>
                    </>
                  ) : (
                    <>
                      <p>Your Address</p>
                      <p>Your City, State</p>
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">To</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {(currentInvoice.customer as any)?.businessName || currentInvoice.customer?.name}
                  </p>
                  {(currentInvoice.customer as any)?.businessRegistrationNumber && (
                    <p className="text-sm">Registration: {(currentInvoice.customer as any).businessRegistrationNumber}</p>
                  )}
                  <p>{currentInvoice.customer?.email}</p>
                  {currentInvoice.customer?.phone && <p>{currentInvoice.customer.phone}</p>}
                  {currentBusinessAddress && (
                    <>
                      <p>{currentBusinessAddress.address}</p>
                      <p>{currentBusinessAddress.street} {currentBusinessAddress.houseNumber}</p>
                      <p>{currentBusinessAddress.state}, {currentBusinessAddress.country}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Invoice Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Invoice Date:</span> {format(new Date(currentInvoice.createdAt), 'MMM dd, yyyy')}</p>
                  <p><span className="font-medium">Language:</span> {currentInvoice.language?.toUpperCase() || 'EN'}</p>
                  <p><span className="font-medium">Template:</span> {currentInvoice.governmentTemplate || 'Standard'}</p>
                  {currentInvoice.order?.paymentType && (
                    <p><span className="font-medium">Payment Type:</span> {currentInvoice.order.paymentType.name}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="separator border-t border-gray-200 mb-6" />
            
            <div className="mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium border border-gray-200">Description</th>
                    <th className="text-center py-3 px-4 font-medium border border-gray-200">Qty</th>
                    <th className="text-right py-3 px-4 font-medium border border-gray-200">Unit Price</th>
                    <th className="text-right py-3 px-4 font-medium border border-gray-200">Tax</th>
                    <th className="text-right py-3 px-4 font-medium border border-gray-200">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const items = currentInvoice?.order?.orderCarts || [];
                    return items.length > 0 ? (
                      items.map((item, index) => {
                        const unitPrice = Number(item.unitPrice) || 0;
                        const quantity = Number(item.quantity) || 0;
                        const taxRate = Number(item.taxRate) || 0;
                        const itemSubtotal = quantity * unitPrice;
                        const itemTax = itemSubtotal * (taxRate / 100);
                        const itemTotal = itemSubtotal + itemTax;
                        
                        return (
                          <tr key={item.id || index} className="border-b">
                            <td className="py-3 px-4 border border-gray-200">
                              <div>
                                <p className="font-medium">{item.product?.name || item.name || 'Custom Item'}</p>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center border border-gray-200">{quantity}</td>
                            <td className="py-3 px-4 text-right border border-gray-200">${unitPrice.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right border border-gray-200">${itemTax.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-medium border border-gray-200">${itemTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 px-4 text-center text-gray-500 border border-gray-200">
                          No items found
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            
            <div className="totals-section flex justify-end mb-8">
              <div className="totals-box w-64">
                <div className="space-y-2 text-sm">
                  <div className="totals-row flex justify-between py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="totals-row flex justify-between py-2">
                    <span className="font-medium">Tax:</span>
                    <span>${totalTax.toFixed(2)}</span>
                  </div>
                  <div className="totals-separator border-t border-gray-200 my-2" />
                  <div className="totals-row totals-total flex justify-between py-2 text-lg font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="terms mt-8">
              <h3 className="text-lg font-semibold mb-3">Payment Terms</h3>
              <div className="terms-list text-sm text-gray-600 space-y-2">
                <p>• Payment is due within 30 days of invoice date.</p>
                <p>• All prices are quoted in USD.</p>
                <p>• Late payments may incur additional charges.</p>
                <p>• Please contact us if you have any questions regarding this invoice.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={getStatusBadgeVariant(currentInvoice.status)}>
                    {currentInvoice.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{currentInvoice.order?.orderCarts?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{format(new Date(currentInvoice.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{currentInvoice.language?.toUpperCase() || 'EN'}</span>
                </div>
                {currentInvoice.order?.paymentType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Type:</span>
                    <span className="font-medium">{currentInvoice.order.paymentType.name}</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${totalTax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentInvoice.customer ? (
                <div>
                  <p className="font-medium text-gray-900">
                    {(currentInvoice.customer as any)?.businessName || currentInvoice.customer.name}
                  </p>
                  {(currentInvoice.customer as any)?.businessRegistrationNumber && (
                    <p className="text-sm text-gray-600">Reg: {(currentInvoice.customer as any).businessRegistrationNumber}</p>
                  )}
                  <p className="text-sm text-gray-600">{currentInvoice.customer.email}</p>
                  {currentInvoice.customer.phone && (
                    <p className="text-sm text-gray-600">{currentInvoice.customer.phone}</p>
                  )}
                  {currentBusinessAddress && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Business Address:</p>
                      <p className="text-sm text-gray-600">{currentBusinessAddress.address}</p>
                      <p className="text-sm text-gray-600">{currentBusinessAddress.street} {currentBusinessAddress.houseNumber}</p>
                      <p className="text-sm text-gray-600">{currentBusinessAddress.state}, {currentBusinessAddress.country}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No customer information available</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/invoices/${id}/edit`)}
              >
                <IconPencil className="mr-2 h-4 w-4" /> Edit Invoice
              </Button>
              {currentInvoice.status === 'DRAFT' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleIssueInvoice}
                >
                  <IconSend className="mr-2 h-4 w-4" /> Issue Invoice
                </Button>
              )}
              {currentInvoice.status === 'ISSUED' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleMarkAsPaid}
                >
                  <IconCheck className="mr-2 h-4 w-4" /> Mark as Paid
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleDownloadPDF}
              >
                <IconDownload className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handlePrint}
              >
                <IconPrinter className="mr-2 h-4 w-4" /> Print Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 