import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconEye, IconEdit, IconTrash, IconFileInvoice, IconFileText, IconSearch, IconDotsVertical } from '@tabler/icons-react';
import { fetchOrders, deleteOrder, convertOrderToInvoice } from '../orderSlice';
import { type AppDispatch, type RootState } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { Order } from '../models/orderModels';

export function OrdersList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { orders, isLoading, pagination } = useSelector((state: RootState) => state.orders);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [language, setLanguage] = useState('en-US');
  const [governmentTemplate, setGovernmentTemplate] = useState('standard');

  useEffect(() => {
    dispatch(fetchOrders({ page: pagination.currentPage, limit: 10 }));
  }, [dispatch, pagination.currentPage]);

  const handleDeleteOrder = (id: string) => {
    setOrderToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      await dispatch(deleteOrder(orderToDelete)).unwrap();
      toast.success('Order deleted successfully');
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete order');
    }
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchOrders({ page: newPage, limit: 10 }));
  };

  const handleConvertToInvoice = async () => {
    if (!selectedOrder) return;
    
    try {
      await dispatch(convertOrderToInvoice({
        id: selectedOrder.id,
        data: { language, governmentTemplate }
      })).unwrap();
      toast.success('Order converted to invoice successfully');
      setConvertDialogOpen(false);
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to convert order to invoice');
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue<string>('id')?.slice(0, 8)}...
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => {
        const order = row.original;
        return order.customer ? (
          <div>
            <div className="font-medium">{order.customer.name}</div>
            <div className="text-sm text-muted-foreground">{order.customer.email}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">No customer</span>
        );
      },
      filterFn: (row, value) => {
        const order = row.original;
        const customerName = order.customer?.name?.toLowerCase() || '';
        return customerName.includes(value.toLowerCase());
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue<string>('totalAmount') || '0');
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      id: 'quote',
      header: 'Quote',
      cell: ({ row }) => {
        const order = row.original;
        return order.quote ? (
          <Badge variant="outline">
            {order.quote.status}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: 'invoice',
      header: 'Invoice',
      cell: ({ row }) => {
        const order = row.original;
        return order.invoice ? (
          <Badge variant={order.invoice.status === 'ISSUED' ? 'default' : 'secondary'}>
            {order.invoice.status}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: 'paymentType',
      header: 'Payment Type',
      cell: ({ row }) => {
        const order = row.original;
        return order.paymentType ? (
          <span className="text-sm">{order.paymentType.name}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.getValue<string>('createdAt'));
        return (
          <div className="text-sm">
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex h-8 w-8"
                size="icon"
              >
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                <IconEye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/edit`)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Edit Order
              </DropdownMenuItem>
              {!order.invoice ? (
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedOrder(order);
                    setConvertDialogOpen(true);
                  }}
                >
                  <IconFileInvoice className="mr-2 h-4 w-4" />
                  Convert to Invoice
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => navigate(`/invoices/${order.invoice?.id}`)}>
                  <IconFileInvoice className="mr-2 h-4 w-4" />
                  View Invoice
                </DropdownMenuItem>
              )}
              {order.quote && (
                <DropdownMenuItem onClick={() => navigate(`/quotations/${order.quote?.id}`)}>
                  <IconFileText className="mr-2 h-4 w-4" />
                  View Quote
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500" 
                onClick={() => handleDeleteOrder(order.id)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pagination.currentPage - 1,
        pageSize: pagination.limit,
      },
    },
  });

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-0 sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full sm:w-full lg:w-[300px]">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8 h-10"
              value={(table.getColumn('customer')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('customer')?.setFilterValue(event.target.value)
              }
            />
          </div>
        </div>
        <Button onClick={() => navigate('/orders/new')} className="w-full sm:w-auto">
          <IconPlus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                        <span>Loading orders...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-muted-foreground">
                          {table.getColumn('customer')?.getFilterValue() ? 
                            'No orders match your search.' : 
                            'No orders found.'}
                        </div>
                        {!table.getColumn('customer')?.getFilterValue() && (
                          <div className="text-sm text-muted-foreground">
                            Get started by creating your first order.
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {pagination.total} Orders
        </div>
        <div className="order-1 sm:order-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.currentPage > 1) {
                      handlePageChange(pagination.currentPage - 1);
                    }
                  }}
                  className={pagination.currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === pagination.currentPage}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.currentPage < pagination.totalPages) {
                      handlePageChange(pagination.currentPage + 1);
                    }
                  }}
                  className={pagination.currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteOrder}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Invoice Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Convert Order to Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template">Government Template</Label>
              <Select value={governmentTemplate} onValueChange={setGovernmentTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConvertToInvoice}>
                Convert to Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 