"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const STATUSES = [
  { value: "NEW", label: "New", color: "bg-blue-100 text-blue-700" },
  { value: "CONTACTED", label: "Contacted", color: "bg-yellow-100 text-yellow-700" },
  { value: "INTERESTED", label: "Interested", color: "bg-green-100 text-green-700" },
  { value: "NOT_INTERESTED", label: "Not Interested", color: "bg-gray-100 text-gray-700" },
  { value: "CLOSED", label: "Closed", color: "bg-purple-100 text-purple-700" }
];

export const StatusDropdown = ({ leadId, currentStatus }: { leadId: string, currentStatus: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const activeStatus = STATUSES.find(s => s.value === currentStatus) || STATUSES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await api.patch(`/businesses/${leadId}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    }
  });

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${activeStatus.color} hover:opacity-80 shadow-sm border border-black/5`}
      >
        {activeStatus.label}
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          {STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                if (status.value !== currentStatus) {
                  updateStatusMutation.mutate(status.value);
                }
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between hover:bg-gray-50 transition-colors ${
                status.value === currentStatus ? "text-accent-primary" : "text-gray-700"
              }`}
            >
              {status.label}
              {status.value === currentStatus && <Check size={14} className="text-accent-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
