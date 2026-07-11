'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

// Mock data for analytics since backend only returns aggregates right now
const jobActivityData = [
  { name: 'Mon', completed: 40, failed: 24, queued: 12 },
  { name: 'Tue', completed: 30, failed: 13, queued: 22 },
  { name: 'Wed', completed: 20, failed: 8, queued: 29 },
  { name: 'Thu', completed: 27, failed: 39, queued: 20 },
  { name: 'Fri', completed: 18, failed: 48, queued: 21 },
  { name: 'Sat', completed: 23, failed: 38, queued: 25 },
  { name: 'Sun', completed: 34, failed: 43, queued: 21 },
];

const businessGrowthData = [
  { name: 'Week 1', businesses: 120 },
  { name: 'Week 2', businesses: 250 },
  { name: 'Week 3', businesses: 400 },
  { name: 'Week 4', businesses: 650 },
  { name: 'Week 5', businesses: 890 },
];

const COLORS = ['#0052ff', '#10b981', '#f43f5e', '#f59e0b'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const fetchStats = async () => {
    try {
      const token = getCookie('jwt');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0052ff]"></div>
      </div>
    );
  }

  const jobDistribution = stats ? [
    { name: 'Active', value: stats.activeJobs || 15 },
    { name: 'Completed', value: (stats.totalJobs || 100) - (stats.activeJobs || 15) }
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 tracking-wide flex items-center gap-3">
          <TrendingUp className="text-[#0052ff]" size={32} />
          Detailed Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Activity Chart */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,82,255,0.04)] hover:border-gray-200 transition-all duration-300">
           <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
             <BarChart2 className="text-[#0052ff]" size={20} />
             Weekly Job Activity
           </h3>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={jobActivityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                 <Tooltip 
                   cursor={{fill: '#f9fafb'}}
                   contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                 />
                 <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                 <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                 <Bar dataKey="failed" name="Failed" stackId="a" fill="#f43f5e" />
                 <Bar dataKey="queued" name="Queued" stackId="a" fill="#0052ff" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Business Growth Chart */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,82,255,0.04)] hover:border-gray-200 transition-all duration-300">
           <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
             <TrendingUp className="text-[#0052ff]" size={20} />
             Businesses Scraped Over Time
           </h3>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={businessGrowthData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                 />
                 <Line type="monotone" dataKey="businesses" name="Total Businesses" stroke="#0052ff" strokeWidth={4} dot={{ r: 6, fill: '#0052ff', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Job Status Distribution */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,82,255,0.04)] hover:border-gray-200 transition-all duration-300 lg:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="md:w-1/2 w-full">
             <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
               <PieChartIcon className="text-[#0052ff]" size={20} />
               Current Job Distribution
             </h3>
             <p className="text-gray-500 mb-6 text-sm">Overview of currently running vs historically completed jobs.</p>
             
             <div className="space-y-4">
                {jobDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-[#f8fafc]">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-semibold text-gray-700 text-sm">{entry.name} Jobs</span>
                    </div>
                    <span className="font-bold text-gray-900">{entry.value}</span>
                  </div>
                ))}
             </div>
           </div>
           
           <div className="h-64 w-full md:w-1/2 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={jobDistribution}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {jobDistribution.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                   itemStyle={{ color: '#111827', fontWeight: 500 }}
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
