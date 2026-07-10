"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import {
  Wrench, Home, Monitor, Utensils, Stethoscope, Briefcase,
  ChevronDown, Settings2, Zap, Building2, GraduationCap,
  Dumbbell, Scissors, Car, Pill, Megaphone, BedDouble,
  Landmark, ShoppingCart, Search, MapPin, Gauge
} from "lucide-react";

const BUSINESS_CATEGORIES = [
  { id: "plumbers", label: "Plumbers", icon: <Wrench size={18} /> },
  { id: "real_estate", label: "Real Estate Agents", icon: <Home size={18} /> },
  { id: "software", label: "Software Companies", icon: <Monitor size={18} /> },
  { id: "restaurants", label: "Restaurants", icon: <Utensils size={18} /> },
  { id: "dentists", label: "Dentists", icon: <Stethoscope size={18} /> },
  { id: "lawyers", label: "Lawyers", icon: <Briefcase size={18} /> },
  { id: "hospitals", label: "Hospitals", icon: <Building2 size={18} /> },
  { id: "schools", label: "Schools", icon: <GraduationCap size={18} /> },
  { id: "gyms", label: "Gyms & Fitness Centers", icon: <Dumbbell size={18} /> },
  { id: "salons", label: "Beauty Salons", icon: <Scissors size={18} /> },
  { id: "car_dealers", label: "Car Dealerships", icon: <Car size={18} /> },
  { id: "pharmacies", label: "Pharmacies", icon: <Pill size={18} /> },
  { id: "marketing", label: "Marketing Agencies", icon: <Megaphone size={18} /> },
  { id: "hotels", label: "Hotels", icon: <BedDouble size={18} /> },
  { id: "banks", label: "Banks & Credit Unions", icon: <Landmark size={18} /> },
  { id: "supermarkets", label: "Supermarkets", icon: <ShoppingCart size={18} /> },
];

const PRESET_LIMITS = [
  { value: 50, label: "50 Leads", sub: "Quick Test" },
  { value: 100, label: "100 Leads", sub: "Standard" },
  { value: 500, label: "500 Leads", sub: "Deep Search" },
  { value: 2000, label: "2000 Leads", sub: "Maximum" },
];

const jobSchema = z.object({
  keyword: z.string().min(1, "Search keyword is required"),
  location: z.string().min(1, "Location is required for targeted scraping"),
  maxResults: z.number().min(10).max(5000),
  concurrency: z.number().min(1).max(20),
  headless: z.boolean(),
});

type JobForm = z.infer<typeof jobSchema>;

const DynamicMap = dynamic(() => import("@/components/MapComponent"), { ssr: false, loading: () => <div className="w-full h-full bg-bg-secondary animate-pulse rounded-3xl" /> });

export default function NewJobPage() {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      keyword: "",
      location: "",
      maxResults: 100,
      concurrency: 5,
      headless: true
    }
  });

  const keywordValue = watch("keyword");
  const locationValue = watch("location");
  const maxResultsValue = watch("maxResults");

  // Handle clicking outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createJobMutation = useMutation({
    mutationFn: async (data: JobForm) => {
      const response = await api.post("/jobs", {
        keyword: data.keyword,
        location: data.location,
        options: {
          category: data.keyword,
          location: data.location,
          maxResults: data.maxResults,
          headless: data.headless,
          concurrency: data.concurrency
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

  const filteredCategories = BUSINESS_CATEGORIES.filter(c =>
    c.label.toLowerCase().includes((keywordValue || "").toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col h-full gap-6">
      <div className="text-center py-10 flex flex-col gap-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-bg-secondary via-bg-canvas to-bg-secondary border border-border-color shadow-sm">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] z-0 pointer-events-none"></div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight z-10 text-text-primary">
          Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-cyan-400">Target Audience</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto z-10 font-medium">
          Initialize the deep-extraction engine to discover high-quality business leads instantly.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Form Area */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <form onSubmit={handleSubmit((data) => createJobMutation.mutate(data))} className="flex flex-col gap-6">
            
            {/* The Hero Search Box */}
            <div className="bg-bg-canvas border border-border-color shadow-xl rounded-[2rem] p-4 flex flex-col md:flex-row gap-4 relative z-20">
              
              {/* Keyword Input */}
              <div className="flex-1 flex flex-col relative" ref={dropdownRef}>
                <div className="flex items-center px-4 py-3 bg-bg-secondary hover:bg-bg-tertiary transition-colors rounded-2xl border border-transparent focus-within:border-accent-primary/50 focus-within:bg-bg-canvas group cursor-text">
                  <Search className="text-text-muted group-focus-within:text-accent-primary shrink-0 mr-3 transition-colors" size={24} />
                  <div className="flex flex-col flex-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest select-none">What</label>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. Plumbers, Software..."
                      {...register("keyword")}
                      onClick={() => setIsDropdownOpen(true)}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="w-full bg-transparent text-lg font-bold text-text-primary placeholder:text-text-muted/50 focus:outline-none"
                    />
                  </div>
                  <ChevronDown size={20} className={`text-text-muted transition-transform duration-200 cursor-pointer ${isDropdownOpen ? "rotate-180" : ""}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
                </div>
                {errors.keyword && <span className="absolute -bottom-5 left-4 text-[11px] text-error font-bold">{errors.keyword.message}</span>}

                {/* Dropdown for Keyword */}
                {isDropdownOpen && (
                  <div className="absolute top-[80px] left-0 right-0 bg-bg-canvas/95 backdrop-blur-xl border border-border-color/50 rounded-2xl shadow-2xl z-30 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200 p-2">
                    {filteredCategories.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {filteredCategories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setValue("keyword", category.label, { shouldValidate: true });
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-accent-primary/10 text-left transition-all w-full group"
                          >
                            <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary group-hover:bg-accent-primary group-hover:text-white transition-all shadow-sm">
                              {category.icon}
                            </div>
                            <span className="font-bold text-text-primary group-hover:text-accent-primary transition-colors text-base">{category.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-text-secondary flex flex-col items-center gap-2">
                        <Search size={24} className="opacity-20" />
                        <span className="text-sm font-medium">Press enter to search for "{keywordValue}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Divider (Desktop) */}
              <div className="hidden md:block w-[1px] bg-border-color/50 my-2 mx-1 self-stretch"></div>

              {/* Location Input */}
              <div className="flex-1 flex flex-col relative">
                <div className="flex items-center px-4 py-3 bg-bg-secondary hover:bg-bg-tertiary transition-colors rounded-2xl border border-transparent focus-within:border-accent-primary/50 focus-within:bg-bg-canvas group cursor-text">
                  <MapPin className="text-text-muted group-focus-within:text-accent-primary shrink-0 mr-3 transition-colors" size={24} />
                  <div className="flex flex-col flex-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest select-none">Where</label>
                    <input
                      type="text"
                      placeholder="e.g. New York, Dubai..."
                      {...register("location")}
                      className="w-full bg-transparent text-lg font-bold text-text-primary placeholder:text-text-muted/50 focus:outline-none"
                    />
                  </div>
                </div>
                {errors.location && <span className="absolute -bottom-5 left-4 text-[11px] text-error font-bold">{errors.location.message}</span>}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={createJobMutation.isPending}
                className="md:w-auto w-full bg-accent-primary hover:bg-accent-hover hover:-translate-y-1 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:shadow-accent-primary/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {createJobMutation.isPending ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Zap size={24} fill="currentColor" />
                )}
                <span className="hidden md:inline">Search</span>
              </button>
            </div>

            {/* Quota / Limit Selector (Prominent) */}
            <div className="bg-bg-canvas border border-border-color rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Gauge size={18} className="text-accent-primary" />
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Extraction Quota</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRESET_LIMITS.map((preset) => {
                  const isSelected = maxResultsValue === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setValue("maxResults", preset.value, { shouldValidate: true })}
                      className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${
                        isSelected 
                          ? "border-accent-primary bg-accent-primary/5 shadow-md scale-[1.02]" 
                          : "border-border-color bg-bg-secondary hover:border-accent-primary/30 hover:bg-bg-tertiary"
                      }`}
                    >
                      <span className={`text-lg font-black ${isSelected ? "text-accent-primary" : "text-text-primary"}`}>
                        {preset.value}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isSelected ? "text-accent-primary/80" : "text-text-muted"}`}>
                        {preset.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-border-color"></div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary hover:bg-border-color transition-colors text-xs font-bold text-text-secondary uppercase tracking-widest"
              >
                <Settings2 size={14} />
                {showAdvanced ? "Hide Engine Config" : "Engine Config"}
              </button>
              <div className="flex-1 h-[1px] bg-border-color"></div>
            </div>

            {/* Advanced Options Panel */}
            {showAdvanced && (
              <div className="bg-bg-secondary/50 border border-border-color rounded-3xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
                      Scraper Concurrency
                    </label>
                    <span className="text-xs font-mono text-warning font-bold bg-warning/10 px-3 py-1 rounded-full">
                      {watch("concurrency")} Workers
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary font-medium">Number of parallel browser contexts. Higher is faster but uses more RAM.</p>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    {...register("concurrency", { valueAsNumber: true })}
                    className="w-full accent-warning h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer mt-2"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-color/30">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-text-primary uppercase tracking-wider">Headless Engine</label>
                    <span className="text-xs text-text-secondary font-medium">Run Playwright invisibly in the background.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register("headless")} className="sr-only peer" />
                    <div className="w-12 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary border border-border-color"></div>
                  </label>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Live Map Preview Area */}
        <div className="lg:col-span-5 h-[500px] lg:h-[600px] rounded-3xl overflow-hidden bg-bg-canvas border border-border-color shadow-xl relative sticky top-6">
          <div className="absolute inset-0 p-2 pointer-events-none">
            <DynamicMap locationQuery={locationValue || ""} keywordQuery={keywordValue || ""} />
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 bg-bg-canvas/90 backdrop-blur-md border border-border-color shadow-lg p-4 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Target Zone</span>
              <span className="text-sm font-bold text-text-primary truncate max-w-[200px]">
                {locationValue || "Global"}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-border-color mx-2"></div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Target Niche</span>
              <span className="text-sm font-bold text-accent-primary truncate max-w-[200px]">
                {keywordValue || "Any Business"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
