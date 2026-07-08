"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const jobSchema = z.object({
  keyword: z.string().min(1, "Search keyword is required"),
  location: z.string().optional(),
});

type JobForm = z.infer<typeof jobSchema>;

export default function NewJobPage() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: JobForm) => {
      const response = await api.post("/jobs", {
        keyword: data.keyword,
        location: data.location || undefined,
        options: {
          category: data.keyword,
          location: data.location || "Global",
          maxResults: 500,
          headless: true,
          concurrency: 5
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Job started successfully!");
      router.push("/");
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in first.");
        router.push("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to create job.");
      }
    },
  });

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">New Extraction Job</h1>
        <p className="text-text-secondary">Start a new Playwright scraping job on the lead engine.</p>
      </div>

      <form onSubmit={handleSubmit((data) => createJobMutation.mutate(data))} className="bg-bg-secondary border border-border-color rounded-2xl p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <label htmlFor="keyword" className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Search Keyword (Required)
          </label>
          <input
            id="keyword"
            type="text"
            placeholder="e.g. Plumbers, Real Estate Agents, Software Companies"
            {...register("keyword")}
            className={`w-full bg-bg-primary border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-colors ${
              errors.keyword ? "border-error focus:border-error focus:ring-error" : "border-border-color focus:border-accent-primary focus:ring-accent-primary"
            }`}
          />
          {errors.keyword && <span className="text-xs text-error font-medium">{errors.keyword.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="location" className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Location (Optional)
          </label>
          <input
            id="location"
            type="text"
            placeholder="e.g. New York, London, Remote"
            {...register("location")}
            className={`w-full bg-bg-primary border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-colors ${
              errors.location ? "border-error focus:border-error focus:ring-error" : "border-border-color focus:border-accent-primary focus:ring-accent-primary"
            }`}
          />
          {errors.location && <span className="text-xs text-error font-medium">{errors.location.message}</span>}
        </div>

        <button
          type="submit"
          disabled={createJobMutation.isPending}
          className="mt-4 bg-accent-primary hover:bg-accent-hover text-white font-medium px-6 py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createJobMutation.isPending ? (
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
