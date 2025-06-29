import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  IconPencil,
  IconTrash,
  IconPrinter,
  IconDotsVertical,
  IconSearch,
  IconPlus,
  IconSend,
} from '@tabler/icons-react';

import { fetchQuotes, deleteQuote } from '../quoteSlice';
import { type Quote } from '../models/quoteModels';
import { type RootState, type AppDispatch } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export function QuotationsList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { quotes, isLoading, pagination } = useSelector((state: RootState) => state.quotes);
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    dispatch(fetchQuotes({ page: pagination.currentPage, limit: pagination.limit }));
  }, [dispatch, pagination.currentPage, pagination.limit]);
  
  const handleDeleteQuote = (id: string) => {
    setQuoteToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteQuote = () => {
    if (quoteToDelete) {
      dispatch(deleteQuote(quoteToDelete));
      setShowDeleteDialog(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchQuotes({ page: newPage, limit: pagination.limit }));
  };
  
  const getStatusBadgeVariant = (status: Quote['status']) => {
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

  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => {
        const customer = row.original.customer;
        return customer ? customer.name : 'N/A';
      },
      filterFn: (row, value) => {
        const customer = row.original.customer;
        const customerName = customer?.name?.toLowerCase() || '';
        return customerName.includes(value.toLowerCase());
      },
    },
    {
      accessorKey: 'totalEstimate',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalEstimate'));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
        return formatted;
      },
    },
    {
      accessorKey: 'expiresAt',
      header: 'Expiry Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('expiresAt'));
        return format(date, 'dd/MM/yyyy');
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as Quote['status'];
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return format(date, 'dd/MM/yyyy');
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const quote = row.original;
        
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
              <DropdownMenuItem onClick={() => navigate(`/quotations/${quote.id}/edit`)}>
                <IconPencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/quotations/${quote.id}`)}>
                <IconPrinter className="mr-2 h-4 w-4" />
                View & Print
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (quote.status === 'DRAFT') {
                    navigate(`/quotations/${quote.id}/edit?action=send`);
                  }
                }}
                disabled={quote.status !== 'DRAFT'}
              >
                <IconSend className="mr-2 h-4 w-4" />
                Send to Client
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500" 
                onClick={() => handleDeleteQuote(quote.id)}
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
    data: quotes,
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
              placeholder="Search quotations..."
              className="pl-8 h-10"
              value={(table.getColumn('customer')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('customer')?.setFilterValue(event.target.value)
              }
            />
          </div>
        </div>
        <Button onClick={() => navigate('/quotations/new')} className="w-full sm:w-auto">
          <IconPlus className="mr-2 h-4 w-4" /> New Quote
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
                      <span>Loading quotations...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-muted-foreground">
                        {table.getColumn('customer')?.getFilterValue() ? 
                          'No quotations match your search.' : 
                          'No quotations found.'}
                      </div>
                      {!table.getColumn('customer')?.getFilterValue() && (
                        <div className="text-sm text-muted-foreground">
                          Get started by creating your first quotation.
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
          {pagination.total} Quotations
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
              Are you sure you want to delete this quote? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteQuote}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 