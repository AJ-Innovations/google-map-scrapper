import Link from "next/link";
import LiveJobsTable from "@/components/LiveJobsTable";
import DashboardStats from "@/components/DashboardStats";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-text-secondary text-lg">Real-time insights into your lead extraction engine.</p>
      </div>

      <DashboardStats />

      <div className="mt-4 bg-bg-secondary border border-border-color rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">Recent Jobs</h2>
        <LiveJobsTable />
      </div>
    </div>
  );
}
