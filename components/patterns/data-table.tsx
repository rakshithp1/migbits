"use client";
// Composition of shadcn/ui MIT components and TanStack Table (MIT).
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
const data = [
  { name: "Migbits", status: "Building", pages: 12 },
  { name: "Studio North", status: "Published", pages: 8 },
  { name: "Forma", status: "Exploring", pages: 6 },
  { name: "Paper House", status: "Published", pages: 24 },
  { name: "Sundays", status: "Building", pages: 4 },
];
type Project = (typeof data)[number];
const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button className="font-medium" onClick={() => column.toggleSorting()}>
        Project ↕
      </button>
    ),
  },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "pages", header: "Pages" },
];
export default function DataTableExample() {
  const [sorting, setSorting] = useState<SortingState>([]),
    [query, setQuery] = useState("");
  // TanStack's table instance is consumed directly by rendering, without memoization.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: query },
    onSortingChange: setSorting,
    onGlobalFilterChange: setQuery,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 3 } },
  });
  return (
    <div className="grid w-full gap-4">
      <Input
        aria-label="Filter projects"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find a project..."
        className="max-w-xs"
      />
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center">
                  No matching projects.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} projects
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
