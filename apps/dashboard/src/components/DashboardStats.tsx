"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function DashboardStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "overview"],
    queryFn: async () => {
      const response = await api.get("/jobs/stats/overview");
      return response.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
      <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 flex flex-col gap-3 transition-all duration-150 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <span className="text-text-muted font-medium text-sm uppercase tracking-wider">Total Leads Extracted</span>
        <span className="text-4xl font-bold text-text-primary">
          {isLoading ? "..." : data?.totalLeads?.toLocaleString() || "0"}
        </span>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-success">↑ {data?.totalLeadsTrend || 0}%</span> from last week
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 flex flex-col gap-3 transition-all duration-150 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <span className="text-text-muted font-medium text-sm uppercase tracking-wider">Active Jobs</span>
        <span className="text-4xl font-bold text-text-primary">
          {isLoading ? "..." : data?.activeJobs?.toLocaleString() || "0"}
        </span>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-success">Running</span> right now
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 flex flex-col gap-3 transition-all duration-150 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <span className="text-text-muted font-medium text-sm uppercase tracking-wider">Success Rate</span>
        <span className="text-4xl font-bold text-text-primary">
          {isLoading ? "..." : `${data?.successRate || 0}%`}
        </span>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-success">↑ {data?.successRateTrend || 0}%</span> from last week
        </div>
      </div>
    </div>
  );
}
