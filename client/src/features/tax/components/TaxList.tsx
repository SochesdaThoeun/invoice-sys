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
  IconPercentage,
  IconWorld,
} from '@tabler/icons-react';

import { fetchTaxCodes, deleteTaxCode } from '../taxSlice';
import { type TaxCode } from '../models/taxModels';
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

export function TaxList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { taxCodes, isLoading, pagination } = useSelector(
    (state: RootState) => state.tax
  );
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [taxCodeToView, setTaxCodeToView] = useState<TaxCode | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taxCodeToDelete, setTaxCodeToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    dispatch(fetchTaxCodes({}));
  }, [dispatch]);
  
  const handleDeleteTaxCode = (id: string) => {
    setTaxCodeToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTaxCode = () => {
    if (taxCodeToDelete) {
      dispatch(deleteTaxCode(taxCodeToDelete));
      setShowDeleteDialog(false);
    }
  };
  
  const handleViewTaxCode = (taxCode: TaxCode) => {
    setTaxCodeToView(taxCode);
    setShowViewDialog(true);
  };

  const columns: ColumnDef<TaxCode>[] = [
    {
      accessorKey: 'countryCode',
      header: 'Country',
      cell: ({ row }) => (
        <div className="flex items-center font-medium">
          <IconWorld className="mr-2 h-4 w-4 text-muted-foreground" />
          {row.getValue('countryCode')}
        </div>
      ),
    },
    {
      accessorKey: 'region',
      header: 'Region',
      cell: ({ row }) => {
        const region = row.getValue('region') as string;
        return region && region.trim() !== '' ? (
          <div className="text-sm">{region}</div>
        ) : (
          <div className="text-sm text-muted-foreground">—</div>
        );
      },
    },
    {
      accessorKey: 'rate',
      header: 'Tax Rate',
      cell: ({ row }) => {
        const rate = row.getValue('rate') as string | number;
        const numericRate = typeof rate === 'string' ? parseFloat(rate) : rate;
        const formattedRate = typeof numericRate === 'number' && !isNaN(numericRate) ? numericRate.toFixed(2) : '0.00';
        return (
          <div className="flex items-center">
            <IconPercentage className="mr-1 h-4 w-4 text-muted-foreground" />
            {formattedRate}%
          </div>
        );
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
        const taxCode = row.original;
        
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
              <DropdownMenuItem onClick={() => navigate(`/tax/${taxCode.id}/edit`)}>
                <IconPencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewTaxCode(taxCode)}>
                <IconEye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500" 
                onClick={() => handleDeleteTaxCode(taxCode.id)}
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
    data: taxCodes,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter tax codes..."
            value={(table.getColumn('countryCode')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('countryCode')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <IconSearch className="h-4 w-4 text-muted-foreground" />
        </div>
        <Button onClick={() => navigate('/tax/new')}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Tax Code
        </Button>
      </div>

      {/* Table */}
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                  ) : (
                    'No tax codes found.'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (pagination.currentPage > 1) {
                      dispatch(fetchTaxCodes({ 
                        page: pagination.currentPage - 1, 
                        limit: pagination.limit 
                      }));
                    }
                  }}
                  className={pagination.currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => dispatch(fetchTaxCodes({ page, limit: pagination.limit }))}
                    isActive={page === pagination.currentPage}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (pagination.currentPage < pagination.totalPages) {
                      dispatch(fetchTaxCodes({ 
                        page: pagination.currentPage + 1, 
                        limit: pagination.limit 
                      }));
                    }
                  }}
                  className={pagination.currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tax Code Details</DialogTitle>
            <DialogDescription>
              View the details of this tax code.
            </DialogDescription>
          </DialogHeader>
          {taxCodeToView && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-country" className="text-right">
                  Country
                </Label>
                <div id="view-country" className="col-span-3 font-medium">
                  {taxCodeToView.countryCode}
                </div>
              </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="view-region" className="text-right">
                   Region
                 </Label>
                 <div id="view-region" className="col-span-3">
                   {taxCodeToView.region && taxCodeToView.region.trim() !== '' ? taxCodeToView.region : '—'}
                 </div>
               </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="view-rate" className="text-right">
                   Tax Rate
                 </Label>
                 <div id="view-rate" className="col-span-3 font-medium">
                   {(() => {
                     const rate = typeof taxCodeToView.rate === 'string' ? parseFloat(taxCodeToView.rate) : taxCodeToView.rate;
                     return typeof rate === 'number' && !isNaN(rate) ? rate.toFixed(2) : '0.00';
                   })()}%
                 </div>
               </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-created" className="text-right">
                  Created
                </Label>
                <div id="view-created" className="col-span-3 text-sm text-muted-foreground">
                  {format(new Date(taxCodeToView.createdAt), 'PPP')}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-updated" className="text-right">
                  Updated
                </Label>
                <div id="view-updated" className="col-span-3 text-sm text-muted-foreground">
                  {format(new Date(taxCodeToView.updatedAt), 'PPP')}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tax Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tax code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTaxCode}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 