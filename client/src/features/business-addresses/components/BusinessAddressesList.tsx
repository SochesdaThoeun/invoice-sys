import { useEffect, useState } from 'react';
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
  IconMapPin,
  IconBuilding,
} from '@tabler/icons-react';

import { fetchBusinessAddresses, deleteBusinessAddress } from '../businessAddressSlice';
import { type BusinessAddress } from '../models/businessAddressModels';
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

export function BusinessAddressesList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { businessAddresses, isLoading } = useSelector(
    (state: RootState) => state.businessAddresses
  );
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [businessAddressToView, setBusinessAddressToView] = useState<BusinessAddress | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [businessAddressToDelete, setBusinessAddressToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    dispatch(fetchBusinessAddresses({}));
  }, [dispatch]);
  
  const handleDeleteBusinessAddress = (id: string) => {
    setBusinessAddressToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBusinessAddress = () => {
    if (businessAddressToDelete) {
      dispatch(deleteBusinessAddress(businessAddressToDelete));
      setShowDeleteDialog(false);
    }
  };
  
  const handleViewBusinessAddress = (businessAddress: BusinessAddress) => {
    setBusinessAddressToView(businessAddress);
    setShowViewDialog(true);
  };

  const columns: ColumnDef<BusinessAddress>[] = [
    {
      accessorKey: 'businessId',
      header: 'Business ID',
      cell: ({ row }) => (
        <div className="flex items-center">
          <IconBuilding className="mr-2 h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{row.getValue('businessId')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="flex items-center">
          <IconMapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <div className="max-w-[200px] truncate">{row.getValue('address')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'street',
      header: 'Street',
      cell: ({ row }) => <div>{row.getValue('street')}</div>,
    },
    {
      accessorKey: 'state',
      header: 'State',
      cell: ({ row }) => <div>{row.getValue('state')}</div>,
    },
    {
      accessorKey: 'country',
      header: 'Country',
      cell: ({ row }) => <div>{row.getValue('country')}</div>,
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
        const businessAddress = row.original;
        
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
              <DropdownMenuItem onClick={() => navigate(`/business-addresses/${businessAddress.id}/edit`)}>
                <IconPencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewBusinessAddress(businessAddress)}>
                <IconEye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500" 
                onClick={() => handleDeleteBusinessAddress(businessAddress.id)}
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
    data: businessAddresses,
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
            placeholder="Search business addresses..."
            value={(table.getColumn('businessId')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('businessId')?.setFilterValue(event.target.value)
            }
            className="h-9"
          />
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <IconSearch className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
        <div>
          <Button onClick={() => navigate('/business-addresses/new')}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Business Address
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
                    <span>Loading business addresses...</span>
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
                      {table.getColumn('businessId')?.getFilterValue() ? 
                        'No business addresses match your search.' : 
                        'No business addresses found.'}
                    </div>
                    {!table.getColumn('businessId')?.getFilterValue() && (
                      <div className="text-sm text-muted-foreground">
                        Get started by adding your first business address.
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
          {table.getFilteredRowModel().rows.length} business address(es) total
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

      {/* Business Address View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Business Address Details</DialogTitle>
            <DialogDescription>
              Detailed information about the business address.
            </DialogDescription>
          </DialogHeader>
          {businessAddressToView && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">Business ID</Label>
                <div className="col-span-3">{businessAddressToView.businessId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">Address</Label>
                <div className="col-span-3">{businessAddressToView.address}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">Street</Label>
                <div className="col-span-3">{businessAddressToView.street}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">House Number</Label>
                <div className="col-span-3">{businessAddressToView.houseNumber}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">State</Label>
                <div className="col-span-3">{businessAddressToView.state}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">Country</Label>
                <div className="col-span-3">{businessAddressToView.country}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">Created</Label>
                <div className="col-span-3">
                  {format(new Date(businessAddressToView.createdAt), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
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
              Are you sure you want to delete this business address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteBusinessAddress}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
 