"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          keyword,
          location: location || undefined,
          options: {},
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in first.");
        }
        throw new Error("Failed to create job.");
      }

      const job = await response.json();
      router.push(`/`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">New Extraction Job</h1>
        <p className="text-text-secondary">Start a new Playwright scraping job on the lead engine.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-color rounded-2xl p-8 flex flex-col gap-6 shadow-sm">
        {error && (
          <div className="bg-error/10 text-error border border-error/20 p-4 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="keyword" className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Search Keyword (Required)
          </label>
          <input
            id="keyword"
            type="text"
            required
            placeholder="e.g. Plumbers, Real Estate Agents, Software Companies"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="location" className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Location (Optional)
          </label>
          <input
            id="location"
            type="text"
            placeholder="e.g. New York, London, Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !keyword}
          className="mt-4 bg-accent-primary hover:bg-accent-hover text-white font-medium px-6 py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting Job...
            </>
          ) : (
            <>
              <span>⚡</span> Start Extraction Engine
            </>
          )}
        </button>
      </form>
    </div>
  );
}
