import { useState } from "react";
import { X, Download } from "lucide-react";

export interface ExportColumn {
  id: string;
  label: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (selectedColumns: string[]) => void;
  availableColumns: ExportColumn[];
}

export function ExportModal({ isOpen, onClose, onExport, availableColumns }: ExportModalProps) {
  const [selectedCols, setSelectedCols] = useState<Set<string>>(
    new Set(availableColumns.map((col) => col.id))
  );

  if (!isOpen) return null;

  const toggleColumn = (id: string) => {
    const newSelected = new Set(selectedCols);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCols(newSelected);
  };

  const handleExport = () => {
    onExport(Array.from(selectedCols));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary/10 p-2 rounded-xl">
              <Download size={20} className="text-accent-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Export Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Select Columns to Export
            </h3>
            <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto">
              {availableColumns.map((col) => (
                <label
                  key={col.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedCols.has(col.id)}
                      onChange={() => toggleColumn(col.id)}
                      className="peer w-5 h-5 appearance-none border-2 border-gray-300 rounded-lg checked:bg-accent-primary checked:border-accent-primary transition-all cursor-pointer"
                    />
                    <svg
                      className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <button
            onClick={() => setSelectedCols(new Set(availableColumns.map((c) => c.id)))}
            className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Select All
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={selectedCols.size === 0}
              className="bg-accent-primary hover:bg-accent-hover text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
