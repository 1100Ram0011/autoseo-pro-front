import React, { useState } from "react";
import { Loader2, Search, Filter, RefreshCw } from "lucide-react";

const CampaignFilters = ({ onRefresh, handleOpenCreateModel, accentGradientClasses, searchQuery, setSearchQuery }) => {
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="relative w-full sm:w-80 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-pages-subhead-text)] transition-colors" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campaigns..."
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-xl text-sm text-[var(--app-pages-text)] placeholder-[var(--app-pages-subhead-text)] shadow-sm"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#020817] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all text-sm font-medium w-full sm:w-auto justify-center shadow-sm">
          <Filter size={16} className="text-gray-500" /> 
          Filters
        </button> */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium w-full sm:w-auto shadow-sm
            ${loading
              ? "bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] border-[var(--app-pages-border)] cursor-not-allowed"
              : "bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] border-[var(--app-pages-border)] active:scale-[0.98]"
            }
          `}
        >
          <RefreshCw size={16} className={`${loading ? "animate-spin text-[var(--app-brand-primary)]" : "text-[var(--app-pages-text)]"}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        <button
          onClick={handleOpenCreateModel}
          className={`whitespace-nowrap group flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:shadow-md active:scale-[0.98] sm:w-auto sm:text-sm`}
        >
          {/* <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-90">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg> */}
          Create Campaign
        </button>
      </div>
    </div>
  );
};

export default CampaignFilters;
