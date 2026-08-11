import React from "react";
import { Search, Users, MessageCircle, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface RecipientSelectorProps {
  chats: any[];
  selectedRecipients: any[];
  setSelectedRecipients: React.Dispatch<React.SetStateAction<any[]>>;
  filter: string;
  setFilter: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
  loading?: boolean;
}

export default function RecipientSelector({
  chats = [],
  selectedRecipients = [],
  setSelectedRecipients,
  filter,
  setFilter,
  search,
  setSearch,
  loading = false,
}: RecipientSelectorProps) {
  const toggleRecipient = (chat: any) => {
    const exists = selectedRecipients.some((item) => item.id === chat.id);
    if (exists) {
      setSelectedRecipients((prev) => prev.filter((item) => item.id !== chat.id));
      return;
    }
    setSelectedRecipients((prev) => [...prev, chat]);
  };

  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-950 p-5 space-y-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold">Recipients</h3>
        <p className="text-xs text-slate-500 mt-1">Select chats and groups</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats..."
          className="pl-9 bg-slate-50 dark:bg-slate-900"
        />
      </div>

      <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
        {["ALL", "CONTACTS", "GROUPS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              filter === f ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {f === "ALL" ? "All" : f === "CONTACTS" ? "Contacts" : "Groups"}
          </button>
        ))}
      </div>

      <ScrollArea className="h-[300px] border rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex h-full items-center justify-center flex-col text-slate-500 p-6 text-center">
            <MessageCircle className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">No chats found</p>
            <p className="text-xs opacity-70">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => {
              const isSelected = selectedRecipients.some((item) => item.id === chat.id);
              return (
                <div
                  key={chat.id}
                  onClick={() => toggleRecipient(chat)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors ${
                    isSelected ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50" : "hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent"
                  } border`}
                >
                  <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-semibold ${chat.isGroup ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                    {chat.isGroup ? <Users size={18} /> : chat.name?.charAt(0).toUpperCase() || <MessageCircle size={18} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="truncate text-sm font-medium">{chat.name || "Unknown"}</h4>
                    <p className="text-xs text-slate-500 truncate">{chat.id.replace("@c.us", "").replace("@g.us", "")}</p>
                  </div>
                  <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
