"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone, Star } from "lucide-react";
import { Suspense } from "react";

function LeadDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const response = await api.get(`/businesses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="bg-error/10 text-error p-8 rounded-2xl text-center border border-error/20">
        <h2 className="text-xl font-bold mb-2">Failed to load lead details</h2>
        <p>{(error as any)?.response?.data?.message || error?.message || "Business not found."}</p>
        <button onClick={() => router.push("/leads")} className="mt-4 px-4 py-2 bg-bg-secondary text-text-primary rounded hover:bg-bg-tertiary border border-border-color">
          Return to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Link href="/leads" className="flex items-center gap-2 text-text-secondary hover:text-text-primary w-fit transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium text-sm">Back to Leads</span>
      </Link>

      <div className="bg-bg-secondary border border-border-color rounded-2xl p-8 flex flex-col gap-8 shadow-sm relative overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">{lead.name}</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                lead.status === 'NEW' ? 'bg-success/10 text-success' :
                lead.status === 'CONTACTED' ? 'bg-accent-glow text-accent-primary' :
                'bg-bg-tertiary text-text-secondary'
              }`}>
                {lead.status}
              </span>
              {lead.category && (
                <span className="text-sm font-medium text-text-secondary px-2.5 py-0.5 rounded-full bg-bg-tertiary">
                  {lead.category}
                </span>
              )}
            </div>
          </div>
          {lead.rating && (
            <div className="flex flex-col items-end gap-1 bg-bg-tertiary px-4 py-2 rounded-xl border border-border-color">
              <div className="flex items-center gap-1 text-warning font-bold text-xl">
                <Star className="w-5 h-5 fill-current" />
                {lead.rating}
              </div>
              <span className="text-xs font-medium text-text-secondary">{lead.reviewsCount || 0} reviews</span>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border-color">
          <div className="flex gap-3 text-text-secondary">
            <Phone className="w-5 h-5 shrink-0 text-text-muted mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Phone</span>
              {lead.phone ? (
                <span className="text-text-primary font-medium">{lead.phone}</span>
              ) : (
                <span className="italic">Not available</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 text-text-secondary">
            <ExternalLink className="w-5 h-5 shrink-0 text-text-muted mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Website</span>
              {lead.website ? (
                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-accent-primary font-medium hover:underline flex items-center gap-1">
                  {lead.website}
                </a>
              ) : (
                <span className="italic">Not available</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 text-text-secondary">
            <MapPin className="w-5 h-5 shrink-0 text-text-muted mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Address</span>
              {lead.address ? (
                <span className="text-text-primary">{lead.address}</span>
              ) : (
                <span className="italic">Not available</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 text-text-secondary">
            <Mail className="w-5 h-5 shrink-0 text-text-muted mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Source Job ID</span>
              <span className="text-text-primary font-mono text-xs mt-1 truncate max-w-[200px]" title={lead.jobId}>{lead.jobId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadDetailsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
      <LeadDetailsContent />
    </Suspense>
  );
}
