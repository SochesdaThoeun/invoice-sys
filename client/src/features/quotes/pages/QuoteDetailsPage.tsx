import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { IconPrinter, IconArrowLeft, IconPencil, IconDownload } from '@tabler/icons-react';

import { fetchQuoteById } from '../quoteSlice';
import { fetchBusinessAddresses, fetchBusinessAddressById } from '../../business-addresses/businessAddressSlice';
import { getUserProfile } from '../../settings/settingsSlice';
import { type RootState, type AppDispatch } from '../../../store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function QuoteDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentQuote, isLoading, error } = useSelector((state: RootState) => state.quotes);
  const { businessAddresses, currentBusinessAddress } = useSelector((state: RootState) => state.businessAddresses);
  const { user } = useSelector((state: RootState) => state.auth);
  const { userProfile } = useSelector((state: RootState) => state.settings);
  const printRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchQuoteById(id));
    }
    dispatch(fetchBusinessAddresses({ page: 1, limit: 100 }));
    dispatch(getUserProfile());
  }, [dispatch, id]);

  // Fetch customer business address when quote is loaded
  useEffect(() => {
    if (currentQuote?.customer?.businessAddressId) {
      dispatch(fetchBusinessAddressById(currentQuote.customer.businessAddressId));
    }
  }, [dispatch, currentQuote?.customer?.businessAddressId]);
  
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
        .quote-print-content {
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
              <title>Quote #${currentQuote?.id}</title>
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
                .quote-print-content { 
                  width: 100%;
                  height: auto;
                  background: white;
                  padding: 0;
                  margin: 0;
                }
                h1 { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: #111; 
                  margin-bottom: 8px;
                }
                h3 { 
                  font-size: 14px; 
                  font-weight: 600; 
                  color: #111; 
                  margin-bottom: 6px;
                  margin-top: 0;
                }
                .header { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: flex-start; 
                  margin-bottom: 20px;
                }
                .badge { 
                  padding: 6px 12px; 
                  border: 1px solid #ddd; 
                  border-radius: 4px; 
                  font-size: 11px;
                  background: #f5f5f5;
                }
                .grid { 
                  display: grid; 
                }
                .grid-cols-2 { 
                  grid-template-columns: repeat(2, minmax(0, 1fr)); 
                }
                .gap-6 { 
                  gap: 20px; 
                }
                .gap-8 { 
                  gap: 24px; 
                }
                .separator { 
                  border-top: 1px solid #e5e7eb; 
                  margin: 16px 0; 
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 12px 0;
                  border: 1px solid #ddd;
                  font-size: 11px;
                }
                th, td { 
                  padding: 8px 10px; 
                  text-align: left; 
                  border: 1px solid #ddd; 
                  vertical-align: top;
                }
                th { 
                  background-color: #f8f9fa; 
                  font-weight: bold; 
                  font-size: 11px;
                }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .text-lg { font-size: 14px; }
                .text-sm { font-size: 11px; }
                .text-xs { font-size: 10px; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-4 { margin-bottom: 16px; }
                .mb-6 { margin-bottom: 20px; }
                .mt-4 { margin-top: 16px; }
                .mt-6 { margin-top: 20px; }
                .space-y-1 > * + * { margin-top: 4px; }
                .space-y-2 > * + * { margin-top: 6px; }
                .text-gray-600 { color: #6b7280; }
                .text-gray-900 { color: #111827; }
                .font-medium { font-weight: 500; }
                .totals-section {
                  display: flex;
                  justify-content: flex-end;
                  margin: 16px 0;
                }
                .totals-box {
                  width: 250px;
                }
                .totals-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 4px 0;
                  font-size: 12px;
                }
                .totals-separator {
                  border-top: 1px solid #ddd;
                  margin: 6px 0;
                }
                .terms {
                  margin-top: 16px;
                }
                .terms h3 {
                  margin-bottom: 8px;
                }
                .terms-list {
                  list-style: none;
                  padding: 0;
                  margin: 0;
                }
                .terms-list li {
                  margin: 3px 0;
                  color: #6b7280;
                  font-size: 10px;
                }
                .w-48 { width: 192px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .justify-end { justify-content: flex-end; }
                .py-1 { padding-top: 4px; padding-bottom: 4px; }
                .border-t { border-top: 1px solid #e5e7eb; }
                .my-1 { margin-top: 4px; margin-bottom: 4px; }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'outline';
      case 'SENT':
        return 'secondary';
      case 'ACCEPTED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'EXPIRED':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const calculateQuoteTotals = () => {
    const items = currentQuote?.order?.orderCarts || [];
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
  
  const { subtotal, totalTax, total } = calculateQuoteTotals();
  
  // Get primary business address
  const primaryBusinessAddress = businessAddresses.find(ba => ba.id) || businessAddresses[0];
  

  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => navigate('/quotations')} className="mt-4">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  if (!currentQuote) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>Quote not found</p>
        <Button variant="outline" onClick={() => navigate('/quotations')} className="mt-4">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 sm:mt-8 px-4 sm:px-6 lg:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/quotations')} className="w-full sm:w-auto">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Quotations
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => navigate(`/quotations/${id}/edit`)} className="w-full sm:w-auto">
            <IconPencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} className="w-full sm:w-auto">
            <IconDownload className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto">
            <IconPrinter className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Quote Content */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div ref={printRef} className="quote-print-content bg-white border border-gray-200 rounded-lg shadow-sm" style={{ 
            width: '100%', 
            minHeight: 'auto',
            padding: '24px',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'Arial, sans-serif',
            color: '#333'
          }}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quotation</h1>
                <p className="text-gray-600 text-base">#{currentQuote.id}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(currentQuote.status)} className="text-sm px-3 py-1">
                {currentQuote.status}
              </Badge>
            </div>
            
            <div className="border-t border-gray-200 mb-6" />
            
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
                    {(currentQuote.customer as any)?.businessName || currentQuote.customer?.name}
                  </p>
                  {(currentQuote.customer as any)?.businessRegistrationNumber && (
                    <p className="text-sm">Registration: {(currentQuote.customer as any).businessRegistrationNumber}</p>
                  )}
                  <p>{currentQuote.customer?.email}</p>
                  {currentQuote.customer?.phone && <p>{currentQuote.customer.phone}</p>}
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
                <h3 className="text-lg font-semibold mb-3">Quote Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Quote Date:</span> {format(new Date(currentQuote.createdAt), 'MMM dd, yyyy')}</p>
                  <p><span className="font-medium">Expiry Date:</span> {format(new Date(currentQuote.expiresAt), 'MMM dd, yyyy')}</p>
                  {currentQuote.order?.paymentType && (
                    <p><span className="font-medium">Payment Type:</span> {currentQuote.order.paymentType.name}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mb-6" />
            
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
                    const items = currentQuote?.order?.orderCarts || [];
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
                                <p className="font-medium">{item.product?.name || item.name || 'Custom Product'}</p>
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
                          No products found
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Tax:</span>
                    <span>${totalTax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2" />
                  <div className="flex justify-between py-2 text-lg font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Terms & Conditions</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• This quote is valid until {format(new Date(currentQuote.expiresAt), 'MMM dd, yyyy')}.</p>
                <p>• All prices are quoted in USD and are subject to change without notice.</p>
                <p>• Payment terms: Net 30 days from invoice date.</p>
                <p>• Please contact us if you have any questions regarding this quote.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary Sidebar */}
        <div className="space-y-6 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={getStatusBadgeVariant(currentQuote.status)}>
                    {currentQuote.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Products:</span>
                  <span className="font-medium">{currentQuote.order?.orderCarts?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{format(new Date(currentQuote.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">{format(new Date(currentQuote.expiresAt), 'MMM dd, yyyy')}</span>
                </div>
                {currentQuote.order?.paymentType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Type:</span>
                    <span className="font-medium">{currentQuote.order.paymentType.name}</span>
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
              {currentQuote.customer ? (
                <div>
                  <p className="font-medium text-gray-900">
                    {(currentQuote.customer as any)?.businessName || currentQuote.customer.name}
                  </p>
                  {(currentQuote.customer as any)?.businessRegistrationNumber && (
                    <p className="text-sm text-gray-600">Reg: {(currentQuote.customer as any).businessRegistrationNumber}</p>
                  )}
                  <p className="text-sm text-gray-600">{currentQuote.customer.email}</p>
                  {currentQuote.customer.phone && (
                    <p className="text-sm text-gray-600">{currentQuote.customer.phone}</p>
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
                onClick={() => navigate(`/quotations/${id}/edit`)}
              >
                <IconPencil className="mr-2 h-4 w-4" /> Edit Quote
              </Button>
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
                <IconPrinter className="mr-2 h-4 w-4" /> Print Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 