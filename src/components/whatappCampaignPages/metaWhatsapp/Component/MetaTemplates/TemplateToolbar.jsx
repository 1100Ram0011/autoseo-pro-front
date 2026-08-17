import React, { useState } from 'react'
import { SearchIcon, SyncIcon, PlusIcon, LoaderIcon } from './ui/WaIcons'
import Button from '@/components/whatappCampaignPages/metaWhatsapp/Component/Button'
import { cn } from '@/lib/utils'

// ─── Search Bar ───────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder }) => {
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative flex-1 max-w-[260px] min-w-[130px]">
      <span className="pointer-events-none absolute left-2.5 top-1/2 flex -translate-y-1/2 text-slate-400 dark:text-[#6b7280]">
        <SearchIcon size={13} />
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'h-9 w-full rounded-md border bg-white dark:bg-[#0f1117] pl-8 pr-3 text-[12px] text-slate-900 dark:text-[#e2e8f0] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 dark:placeholder:text-[#4b5563]',
          focused
            ? 'border-emerald-500 ring-1 ring-emerald-500/20'
            : 'border-slate-300 dark:border-white/[0.12]'
        )}
      />
    </div>
  )
}

// ─── Number Selector ──────────────────────────────────────────────────────────
const NumberSelector = ({ numbers = [], selectedNumber, onNumberChange }) => (
  <div className="relative flex-1 max-w-[200px] min-w-[130px]">
    <label className="absolute -top-[9px] left-2.5 z-[1] bg-white dark:bg-[#10121a] px-[3px] text-[10px] font-medium text-slate-500 dark:text-[#64748b]">
      Select Number
    </label>
    <select
      value={selectedNumber || ''}
      onChange={(e) => onNumberChange(e.target.value)}
      className="h-9 w-full cursor-pointer rounded-md border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#0f1117] px-2.5 text-[12px] text-slate-900 dark:text-[#e2e8f0] outline-none"
    >
      <option value={''}>Select Number</option>
      {numbers?.map((n) => (
        <option key={n?._id} value={n?._id}>
          {n?.phoneNumber}
        </option>
      ))}
    </select>
  </div>
)

// ─── Main Toolbar ─────────────────────────────────────────────────────────────
const TemplateToolbar = ({
  search,
  onSearchChange,
  numbers,
  selectedNumber,
  onNumberChange,
  onSync,
  onCreate,
  onCreateJson,
  onOpenLibrary,
  syncing,
}) => (
  <div className="flex shrink-0 flex-nowrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.07] bg-slate-50/50 dark:bg-transparent px-5 py-3 overflow-x-auto w-full">
    <div className="flex items-center gap-3 flex-grow">
      <SearchBar
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Enter Template Name"
      />
      <NumberSelector
        numbers={numbers}
        selectedNumber={selectedNumber}
        onNumberChange={onNumberChange}
      />
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <Button
        variant="secondary"
        size="sm"
        icon={
          syncing ? (
            <LoaderIcon size={12} color="#10b981" />
          ) : (
            <SyncIcon size={12} />
          )
        }
        onClick={onSync}
        loading={syncing}
        loadingLabel="Syncing…"
        label={!syncing ? 'Sync' : undefined}
      />
      {/* <Button
        variant="secondary"
        size="sm"
        icon={<PlusIcon size={12} />}
        onClick={onCreate}
        label="Create New Template"
      /> */}
      <Button
        variant="primary"
        size="sm"
        icon={<PlusIcon size={12} />}
        onClick={onCreateJson}
        label="Create Template"
      />
    </div>
  </div>
)

export default TemplateToolbar
