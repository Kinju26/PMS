"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/cpos/fields";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  searchPlaceholder = "Search",
  getSearchText,
  pageSize = 6,
  toolbar,
}: {
  rows: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  getSearchText: (row: T) => string;
  pageSize?: number;
  toolbar?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => getSearchText(row).toLowerCase().includes(needle));
  }, [getSearchText, query, rows]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="sm:max-w-xs"
        />
        {toolbar}
      </div>
      {visible.length === 0 ? (
        <EmptyState title="Nothing matches" body="Adjust the search or add a record." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-canvas text-xs tracking-wide text-muted uppercase">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={`px-3 py-2.5 font-medium ${column.className ?? ""}`}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, index) => (
                <tr key={index} className="border-t border-line bg-white">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-3 py-3 align-middle text-ink ${column.className ?? ""}`}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
            Previous
          </Button>
          <span>
            {currentPage} / {pages}
          </span>
          <Button type="button" variant="secondary" size="sm" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
