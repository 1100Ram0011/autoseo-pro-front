"use client";

import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Send, Users, MessageCircle, Image as ImageIcon } from "lucide-react";
import { getCampaignConnections, getWhatsappChats, sendWhatsAppInboxMessage } from "@/lib/whatsappApi";
import RecipientSelector from "@/components/whatsapp/RecipientSelector";
import PhonePreview from "@/components/whatsapp/PhonePreview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WhatsappInboxPage() {
  const [connectionId, setConnectionId] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);
  
  const [mediaType, setMediaType] = useState<"TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO">("TEXT");
  const [mediaUrl, setMediaUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  const [connections, setConnections] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    getCampaignConnections().then(res => setConnections(res?.data || []));
  }, []);

  useEffect(() => {
    if (connectionId) {
      setIsChatsLoading(true);
      getWhatsappChats(connectionId)
        .then(res => setChats(res?.data || []))
        .catch(() => toast.error("Failed to load chats"))
        .finally(() => setIsChatsLoading(false));
    } else {
      setChats([]);
    }
  }, [connectionId]);

  const filteredChats = useMemo(() => {
    let data = [...chats];
    if (filter === "GROUPS") data = data.filter(c => c.isGroup);
    if (filter === "CONTACTS") data = data.filter(c => !c.isGroup);
    if (search.trim()) {
      const val = search.toLowerCase();
      data = data.filter(c => (c.name || "").toLowerCase().includes(val));
    }
    return data;
  }, [chats, filter, search]);

  const stats = useMemo(() => ({
    total: selectedRecipients.length,
    groups: selectedRecipients.filter(item => item.isGroup).length,
    contacts: selectedRecipients.filter(item => !item.isGroup).length,
  }), [selectedRecipients]);

  const handleSend = async () => {
    try {
      if (!connectionId) return toast.error("Select WhatsApp connection");
      if (selectedRecipients.length === 0) return toast.error("Select at least one recipient");
      if (!message.trim() && mediaType === "TEXT") return toast.error("Message is required");

      setIsSending(true);
      const response = await sendWhatsAppInboxMessage({
        connectionId,
        chatIds: selectedRecipients.map(item => item.id),
        content: message,
        mediaType,
        mediaUrl,
        mediaFileName: fileName,
      });
      toast.success(`Sent to ${response?.successCount || selectedRecipients.length} recipients`);
      setSelectedRecipients([]);
      setMessage("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full overflow-hidden p-6 max-w-7xl mx-auto flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WhatsApp Inbox</h1>
          <p className="text-muted-foreground mt-1 text-sm">Send direct messages to your contacts and groups.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 overflow-hidden">
        {/* LEFT PANEL */}
        <section className="flex flex-col min-h-0 bg-white dark:bg-slate-950 rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-6 p-6">
            
            {/* CONNECTION */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">WhatsApp Account</label>
              <select
                value={connectionId}
                onChange={e => setConnectionId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Connection</option>
                {connections.map(item => (
                  <option key={item.connectionId} value={item.connectionId}>
                    {item.displayName || item.name} - {item.linkedNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* RECIPIENTS */}
            <RecipientSelector
              chats={filteredChats}
              loading={isChatsLoading}
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
              selectedRecipients={selectedRecipients}
              setSelectedRecipients={setSelectedRecipients}
            />

            {/* MEDIA */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold">Media Attachment (Optional)</h3>
              <div className="flex gap-2">
                {["TEXT", "IMAGE", "VIDEO", "DOCUMENT"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMediaType(type as any)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border ${mediaType === type ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {mediaType !== "TEXT" && (
                <div className="space-y-3">
                  <Input 
                    placeholder="Media URL" 
                    value={mediaUrl} 
                    onChange={e => setMediaUrl(e.target.value)} 
                    className="bg-slate-50"
                  />
                  {mediaType === "DOCUMENT" && (
                    <Input 
                      placeholder="File Name (e.g. invoice.pdf)" 
                      value={fileName} 
                      onChange={e => setFileName(e.target.value)} 
                      className="bg-slate-50"
                    />
                  )}
                </div>
              )}
            </div>

            {/* MESSAGE */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold">Message Content</h3>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-32 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t bg-slate-50 dark:bg-slate-900 p-4 flex justify-between items-center">
            <p className="text-sm text-slate-500 ml-2">{selectedRecipients.length} recipients selected</p>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </section>

        {/* RIGHT PANEL (Preview & Stats) */}
        <aside className="hidden xl:flex flex-col gap-6">
          <PhonePreview
            sender="Auto SEO Pro"
            mediaType={mediaType}
            mediaUrl={mediaUrl}
            fileName={fileName}
            bodyText={message}
          />

          <div className="rounded-2xl border bg-white dark:bg-slate-950 p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Recipient Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                <div className="text-xs text-slate-500 mt-1">Total</div>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
                <div className="text-lg font-semibold">{stats.groups}</div>
                <div className="text-xs text-slate-500">Groups</div>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-center">
                <MessageCircle className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                <div className="text-lg font-semibold">{stats.contacts}</div>
                <div className="text-xs text-slate-500">Contacts</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
