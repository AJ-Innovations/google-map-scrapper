"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface Business {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  rating: number | null;
  reviewsCount: number | null;
  status: string;
  category: string | null;
}

const columnHelper = createColumnHelper<Business>();

const columns = [
  columnHelper.accessor("name", {
    header: "Business",
    cell: (info) => {
      const lead = info.row.original;
      return (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">{lead.name}</span>
          {lead.category && <span className="text-xs text-text-muted">{lead.category}</span>}
          {lead.address && <span className="text-sm text-text-secondary truncate max-w-[300px]" title={lead.address}>{lead.address}</span>}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "contact",
    header: "Contact",
    cell: (info) => {
      const lead = info.row.original;
      return (
        <div className="flex flex-col gap-1 text-sm">
          {lead.phone ? (
            <span className="text-text-primary">{lead.phone}</span>
          ) : (
            <span className="text-text-muted italic">No phone</span>
          )}
          {lead.website ? (
            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline truncate max-w-[200px]" title={lead.website}>
              {lead.website}
            </a>
          ) : (
            <span className="text-text-muted italic">No website</span>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
    cell: (info) => {
      const lead = info.row.original;
      return lead.rating ? (
        <div className="flex items-center gap-2">
          <span className="text-warning font-bold">★ {lead.rating}</span>
          <span className="text-xs text-text-muted">({lead.reviewsCount || 0})</span>
        </div>
      ) : (
        <span className="text-text-muted text-sm">N/A</span>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          status === 'NEW' ? 'bg-success/10 text-success' :
          status === 'CONTACTED' ? 'bg-accent-glow text-accent-primary' :
          'bg-bg-tertiary text-text-secondary'
        }`}>
          {status}
        </span>
      );
    },
  }),
];

export default function LeadsPage() {
  const router = useRouter();

  const { data: leadsResponse, isLoading, error } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await api.get("/businesses");
      return response.data;
    },
  });

  const leads = leadsResponse?.data || [];

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Leads CRM</h1>
        <p className="text-text-secondary text-lg">Manage and track extracted business leads.</p>
      </div>

      <div className="bg-bg-secondary border border-border-color rounded-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border-color flex justify-between items-center bg-glass-bg">
          <h2 className="text-xl font-semibold">Extracted Businesses</h2>
          <div className="text-sm text-text-muted">
            Total: <span className="font-bold text-text-primary">{leadsResponse?.total || 0}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-error bg-error/5">
            {(error as any)?.response?.data?.message || error.message || "Failed to load leads"}
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-text-muted">No leads found. Run a job to extract leads!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-bg-tertiary text-text-secondary text-sm uppercase tracking-wider">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-6 py-4 font-semibold border-b border-border-color">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-bg-primary divide-y divide-border-color">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-bg-secondary transition-colors group cursor-pointer" onClick={() => router.push(`/leads/${row.original.id}`)}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
