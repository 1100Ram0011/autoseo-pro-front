import React, { useState } from 'react'
import { SearchIcon, SyncIcon, PlusIcon, FilterIcon, CloseIcon, LoaderIcon } from '../ui/Msg91WaIcons'
import { Btn } from '../ui/Msg91WaBaseUI'

// ─── Search bar ───────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder }) => {
    const [focused, setFocused] = useState(false)
    return (
        <div className="relative w-full sm:w-[260px]">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-zinc-500 flex">
                <SearchIcon size={13} />
            </span>
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full h-9 pl-8 pr-3 border rounded-lg text-xs outline-none font-['DM_Sans',sans-serif] transition-all box-border
                    bg-[#fafbfc] dark:bg-zinc-800
                    text-gray-900 dark:text-zinc-100
                    placeholder-gray-400 dark:placeholder-zinc-500
                    ${
                        focused
                            ? 'border-blue-500 dark:border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.15)] dark:shadow-[0_0_0_3px_rgba(59,130,246,0.25)]'
                            : 'border-gray-200 dark:border-zinc-600'
                    }`}
            />
        </div>
    )
}

// ─── NumberSelector ───────────────────────────────────────────────────────────
export const NumberSelector = ({ numbers = [], selectedNumber, onNumberChange }) => (
    <div className="relative w-full sm:min-w-[190px] sm:w-auto">
        <label className="absolute -top-2.5 left-2.5 text-[10px] text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-1 z-[1] font-['DM_Sans',sans-serif]">
            Select Number
        </label>

        <select
            value={selectedNumber || ''}
            onChange={(e) => onNumberChange?.(e.target.value)}
            className="w-full h-9 border border-gray-200 dark:border-zinc-600 rounded-lg px-2.5 text-xs font-['DM_Sans',sans-serif] bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 outline-none"
        >
            {numbers.map(n => (
                <option key={n.value} value={n.value}>
                    {n.value}
                </option>
            ))}
        </select>
    </div>
)

// ─── Main Toolbar ─────────────────────────────────────────────────────────────
const Msg91TemplateToolbar = ({
    search,
    onCreateWhatsAppCampaign,
    numbers,
    selectedNumber,
    onNumberChange,
    isTemplate,
    isCampaign,
    onSearchChange,
    onSync,
    onCreate,
    onFilter,
    syncing,
    handleRefetchCampaign,
    subMaincampaignLoading
}) => {
    return (

        <div className="flex max-w-full flex-col items-stretch gap-3 bg-[var(--app-pages-bg)] px-4 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5 sm:px-5">

            {/* LEFT SIDE */}
            {isTemplate ? (
                <>
                    <SearchBar
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Enter Template Name"
                    />

                    <NumberSelector
                        numbers={numbers}
                        selectedNumber={selectedNumber}
                        onNumberChange={onNumberChange}
                    />
                </>
            ) : (

                <>
                    <div className="min-w-0 mr-4">
                        <h1 className="text-lg font-bold tracking-tight text-[var(--app-pages-text)]">
                            Campaigns
                        </h1>
                        <p className="text-sm leading-relaxed text-[var(--app-pages-subhead-text)]">
                            Create and monitor your WhatsApp outreach.
                        </p>
                    </div>
                    <SearchBar
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search Campaigns..."
                    />
                </>
            )}

            {/* RIGHT SIDE */}
            <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">

                {isTemplate && (
                    <>
                        <Btn
                            variant="gradient"
                            size="md"
                            className="flex-1 justify-center whitespace-nowrap sm:flex-none"
                            icon={
                                syncing
                                    ? <LoaderIcon size={13} color="var(--blue)" />
                                    : <SyncIcon size={13} />
                            }
                            onClick={onSync}
                            disabled={syncing}
                        >
                            {syncing ? 'Syncing...' : 'Sync Template'}
                        </Btn>

                        <Btn
                            variant="gradient"
                            size="md"
                            className="flex-1 justify-center whitespace-nowrap sm:flex-none"
                            icon={<PlusIcon size={13} />}
                            onClick={onCreate}
                        >
                            Create New Template
                        </Btn>
                    </>
                )}

                {isCampaign && (
                    <>

                        <Btn
                            variant="gradient"
                            size="md"
                            className="flex-1 justify-center whitespace-nowrap sm:flex-none"
                            icon={
                                subMaincampaignLoading
                                    ? <LoaderIcon size={13} color="var(--blue)" />
                                    : <SyncIcon size={13} />
                            }
                            onClick={handleRefetchCampaign}
                            disabled={subMaincampaignLoading}
                        >
                            {subMaincampaignLoading ? 'Refresh...' : 'Refresh'}
                        </Btn>
                        <Btn
                            variant="gradient"
                            size="md"
                            className="flex-1 justify-center whitespace-nowrap sm:flex-none"
                            icon={<PlusIcon size={13} />}
                            onClick={onCreateWhatsAppCampaign}
                        >
                            Create Campaign
                        </Btn>
                    </>
                )}

            </div>
        </div>

    )
};

export default Msg91TemplateToolbar;
