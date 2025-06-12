import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
  IconEye,
  IconDotsVertical,
  IconSearch,
  IconPlus,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';

import { fetchCustomers, deleteCustomer } from '../customerSlice';
import { type Customer } from '../models/customerModels';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export function CustomersList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { customers, isLoading, pagination } = useSelector(
    (state: RootState) => state.customers
  );
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    dispatch(fetchCustomers({}));
  }, [dispatch]);
  
  const handleDeleteCustomer = (id: string) => {
    setCustomerToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCustomer = () => {
    if (customerToDelete) {
      dispatch(deleteCustomer(customerToDelete));
      setShowDeleteDialog(false);
    }
  };
  
  const handleViewCustomer = (customer: Customer) => {
    setCustomerToView(customer);
    setShowViewDialog(true);
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        const email = row.getValue('email') as string;
        return email ? (
          <div className="flex items-center">
            <IconMail className="mr-2 h-4 w-4 text-muted-foreground" />
            {email}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string;
        return phone ? (
          <div className="flex items-center">
            <IconPhone className="mr-2 h-4 w-4 text-muted-foreground" />
            {phone}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'businessName',
      header: 'Business',
      cell: ({ row }) => {
        const businessName = row.getValue('businessName') as string;
        return businessName || <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return format(date, 'MMM dd, yyyy');
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const customer = row.original;
        
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
              <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                <IconPencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                <IconEye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500" 
                onClick={() => handleDeleteCustomer(customer.id)}
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
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center space-x-2 md:w-[300px]">
          <Input
            placeholder="Search customers..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="h-9"
          />
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <IconSearch className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
        <div>
          <Button onClick={() => navigate('/customers/new')}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    <span>Loading customers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-muted-foreground">
                      {table.getColumn('name')?.getFilterValue() ? 
                        'No customers match your search.' : 
                        'No customers found.'}
                    </div>
                    {!table.getColumn('name')?.getFilterValue() && (
                      <div className="text-sm text-muted-foreground">
                        Get started by adding your first customer.
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredRowModel().rows.length} customer(s) total
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  table.previousPage();
                }}
                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === table.getState().pagination.pageIndex + 1}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    table.setPageIndex(page - 1);
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
                  table.nextPage();
                }}
                className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Customer View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Detailed information about the customer.
            </DialogDescription>
          </DialogHeader>
          {customerToView && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3">{customerToView.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <div className="col-span-3">{customerToView.email || '-'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phone</Label>
                <div className="col-span-3">{customerToView.phone || '-'}</div>
              </div>
              {customerToView.businessName && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Business Name</Label>
                  <div className="col-span-3">{customerToView.businessName}</div>
                </div>
              )}
              {customerToView.businessRegistrationNumber && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Registration #</Label>
                  <div className="col-span-3">{customerToView.businessRegistrationNumber}</div>
                </div>
              )}
              {customerToView.businessAddress && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Address</Label>
                    <div className="col-span-3">
                      {customerToView.businessAddress.address}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Country</Label>
                    <div className="col-span-3">
                      {customerToView.businessAddress.country}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">State</Label>
                    <div className="col-span-3">
                      {customerToView.businessAddress.state}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteCustomer}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 