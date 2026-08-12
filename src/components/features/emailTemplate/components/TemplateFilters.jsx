import React, { useState } from "react";
import { Loader } from "lucide-react";

const TemplateFilters = ({ onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await onRefresh(); // ensure parent returns promise
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition 
          ${loading
            ? "bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] cursor-not-allowed"
            : "bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] hover:bg-[var(--app-pages-bg)] hover:text-[var(--app-pages-text)] border-[var(--app-pages-border)]"
          }
        `}
      >
        {loading ? (
          <>
            <Loader size={16} className="animate-spin" />
            Refreshing...
          </>
        ) : (
          "Refresh"
        )}
      </button>
    </div>
  );
};

export default TemplateFilters;
