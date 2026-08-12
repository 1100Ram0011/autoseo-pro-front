import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import {
    useGetContactsQuery, useCreateContactMutation, useBulkImportMutation,
    useUpdateContactMutation, useDeleteContactMutation,
    useGetContactListsQuery, useCreateContactListMutation, useDeleteContactListMutation,
    useGetWhatsappNumberQuery,
} from "@/redux/apis/metaWhatsapp.api";
import { cn } from "@/lib/utils.js";
import ConfirmDialog from "@/ReUseAbleComponents/ConfirmDialog.jsx";
import DemoAnimatedAuthModal from "@/ReUseAbleComponents/DemoAnimatedAuthModal";
import AuthPage from "@/pages/user/AuthPage";
import {
    Upload, X, FileSpreadsheet, FileText, CheckCircle2,
    AlertCircle, Plus, Users, ListFilter, Phone, Mail,
    User, Search, ChevronDown, Loader2
} from "lucide-react";

// ─── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({ onClose, isGuest, onRequireAuth }) {
    const [mode, setMode] = useState("file");
    const [raw, setRaw] = useState("");
    const [file, setFile] = useState(null);
    const [parsedContacts, setParsedContacts] = useState([]);
    const [parseError, setParseError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [result, setResult] = useState(null);
    const [bulkImport, { isLoading }] = useBulkImportMutation();
    const fileRef = useRef(null);

    const parseCSVText = (text) => {
        const lines = text.trim().split("\n").filter(Boolean);
        const start = lines[0]?.toLowerCase().includes("phone") ? 1 : 0;
        return lines.slice(start).map((line) => {
            const [phone, name, ...rest] = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
            return { phone, name: name || "", email: rest[0] || null };
        }).filter((c) => c.phone);
    };

    const handleFile = useCallback(async (f) => {
        setParseError(""); setFile(f);
        const ext = f.name.split(".").pop().toLowerCase();
        if (ext === "csv" || ext === "txt") {
            const text = await f.text();
            const contacts = parseCSVText(text);
            if (!contacts.length) { setParseError("No valid contacts found in file."); return; }
            setParsedContacts(contacts);
        } else if (ext === "xlsx" || ext === "xls") {
            try {
                const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
                const ab = await f.arrayBuffer();
                const wb = XLSX.read(ab, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                const start = rows[0]?.some(c => String(c).toLowerCase().includes("phone")) ? 1 : 0;
                const contacts = rows.slice(start).map((row) => ({
                    phone: String(row[0] || "").trim(), name: String(row[1] || "").trim(),
                    email: row[2] ? String(row[2]).trim() : null,
                })).filter((c) => c.phone);
                if (!contacts.length) { setParseError("No valid contacts found in file."); return; }
                setParsedContacts(contacts);
            } catch { setParseError("Failed to parse Excel file. Columns should be: Phone, Name, Email."); }
        } else { setParseError("Unsupported file type. Please use CSV, TXT, XLS, or XLSX."); }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files[0]; if (f) handleFile(f);
    }, [handleFile]);

    const handleImport = async () => {
        if (isGuest) {
            onRequireAuth?.();
            return;
        }
        const contacts = mode === "paste" ? parseCSVText(raw) : parsedContacts;
        if (!contacts.length) { setParseError("No valid contacts to import."); return; }
        try {
            const res = await bulkImport({ contacts }).unwrap();
            setResult(res.message || `${contacts.length} contacts imported.`);
        } catch (err) { setParseError(err.data?.message || "Import failed"); }
    };

    const canImport = mode === "file" ? parsedContacts.length > 0 : raw.trim().length > 0;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[560px] rounded-2xl border border-[#23263a] bg-[#13151c] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between border-b border-[#23263a] px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FB6218]/20 to-[#FEBC02]/20">
                            <Upload size={16} className="text-[#FB6218]" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-semibold text-[#e2e8f0]">Import Contacts</h3>
                            <p className="text-[11px] text-[#64748b]">CSV, Excel (.xlsx), or paste text</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-[#64748b] transition-colors hover:bg-[#1a1d27] hover:text-[#e2e8f0]">
                        <X size={15} />
                    </button>
                </div>
                <div className="p-6">
                    {result ? (
                        <div className="flex flex-col items-center gap-3 py-6 text-center">
                            <CheckCircle2 size={40} className="text-[#4ade80]" />
                            <p className="text-[15px] font-semibold text-[#e2e8f0]">Import Successful</p>
                            <p className="text-[13px] text-[#64748b]">{result}</p>
                            <button onClick={onClose} className="mt-2 cursor-pointer rounded-lg border-none bg-gradient-to-r from-[#FB6218] to-[#FEBC02] px-6 py-2 text-sm font-semibold text-white shadow-md">Done</button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-5 flex rounded-lg border border-[#23263a] bg-[#0f1117] p-1">
                                {[["file", "Upload File"], ["paste", "Paste Text"]].map(([id, label]) => (
                                    <button key={id} onClick={() => { setMode(id); setParseError(""); setParsedContacts([]); }}
                                        className={cn("flex-1 cursor-pointer rounded-md border-none py-1.5 text-[12px] font-medium transition-all",
                                            mode === id
                                                ? "bg-gradient-to-r from-[#FB6218] to-[#FEBC02] text-white shadow-md"
                                                : "bg-transparent text-[#64748b] hover:text-[#94a3b8]"
                                        )}>{label}</button>
                                ))}
                            </div>
                            {mode === "file" ? (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileRef.current?.click()}
                                    className={cn(
                                        "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
                                        dragOver ? "border-[#FB6218] bg-[#FB6218]/5" : "border-[#23263a] bg-[#0f1117] hover:border-[#334155]"
                                    )}
                                >
                                    <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xls" className="hidden"
                                        onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
                                    <div className="flex gap-3">
                                        <FileSpreadsheet size={28} className="text-[#4ade80]" />
                                        <FileText size={28} className="text-[#FEBC02]" />
                                    </div>
                                    {file ? (
                                        <div className="text-center">
                                            <p className="text-[13px] font-medium text-[#e2e8f0]">{file.name}</p>
                                            {parsedContacts.length > 0
                                                ? <p className="text-[11px] text-[#4ade80]">✓ {parsedContacts.length} contacts ready</p>
                                                : <p className="text-[11px] text-[#64748b]">Parsing…</p>}
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-[13px] font-medium text-[#cbd5e1]">Drop file here or click to browse</p>
                                            <p className="mt-1 text-[11px] text-[#475569]">Supports CSV, TXT, XLS, XLSX</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <p className="text-[11px] text-[#64748b]">One per line — <code className="rounded bg-[#1e2130] px-1.5 text-[#FEBC02]">phone, name, email</code></p>
                                    <textarea value={raw} onChange={(e) => { setRaw(e.target.value); setParsedContacts([]); setParseError(""); }}
                                        placeholder={"+919876543210, John Doe, john@example.com\n+1234567890, Jane Smith"}
                                        className="min-h-[160px] w-full resize-y rounded-lg border border-[#23263a] bg-[#0f1117] p-3 font-mono text-[12px] text-[#e2e8f0] outline-none placeholder:text-[#334155] focus:border-[#FB6218]" />
                                    {raw && !parsedContacts.length && (
                                        <button onClick={() => { const c = parseCSVText(raw); if (!c.length) { setParseError("No valid contacts found."); return; } setParseError(""); setParsedContacts(c); }}
                                            className="self-start cursor-pointer rounded-md border border-[#23263a] bg-transparent px-3 py-1 text-[12px] text-[#FB6218] hover:bg-[#FB6218]/10">
                                            Preview ({raw.trim().split("\n").filter(Boolean).length} lines)
                                        </button>
                                    )}
                                    {parsedContacts.length > 0 && <p className="text-[11px] text-[#4ade80]">✓ {parsedContacts.length} contacts parsed</p>}
                                </div>
                            )}
                            <div className="mt-4 rounded-lg border border-[#FB6218]/20 bg-[#FB6218]/5 px-4 py-3">
                                <p className="text-[11px] leading-relaxed text-[#FEBC02]">
                                    <strong>Column order:</strong> Phone (required), Name, Email — header row is auto-detected and skipped.
                                </p>
                            </div>
                            {parseError && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#4b1d1d] bg-[#2d1515] px-3 py-2">
                                    <AlertCircle size={13} className="shrink-0 text-[#f87171]" />
                                    <p className="text-[12px] text-[#f87171]">{parseError}</p>
                                </div>
                            )}
                            <div className="mt-5 flex justify-end gap-2">
                                <button onClick={onClose} className="cursor-pointer rounded-lg border border-[#23263a] bg-transparent px-4 py-2 text-[13px] text-[#94a3b8] hover:bg-[#1a1d27]">Cancel</button>
                                <button onClick={handleImport} disabled={isLoading || !canImport}
                                    className={cn("flex cursor-pointer items-center gap-2 rounded-lg border-none bg-gradient-to-r from-[#FB6218] to-[#FEBC02] px-5 py-2 text-[13px] font-semibold text-white shadow-md transition-opacity",
                                        (isLoading || !canImport) && "cursor-not-allowed opacity-50")}>
                                    {isLoading && <Loader2 size={13} className="animate-spin" />}
                                    {isLoading ? "Importing…" : `Import${parsedContacts.length ? ` ${parsedContacts.length} Contacts` : ""}`}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Add Contact Modal ────────────────────────────────────────────────────────
function AddContactModal({ onClose, onCreate, creating, isGuest, onRequireAuth }) {
    const [contact, setContact] = useState({ phone: "", name: "", email: "" });
    const fields = [
        { key: "phone", label: "Phone Number", placeholder: "+91 98765 43210", icon: Phone, required: true, type: "tel" },
        { key: "name", label: "Full Name", placeholder: "John Doe", icon: User, required: false, type: "text" },
        { key: "email", label: "Email", placeholder: "john@example.com", icon: Mail, required: false, type: "email" },
    ];
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[420px] rounded-2xl border border-[#23263a] bg-[#13151c] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between border-b border-[#23263a] px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FB6218]/20 to-[#FEBC02]/20">
                            <User size={16} className="text-[#FEBC02]" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-semibold text-[#e2e8f0]">Add Contact</h3>
                            <p className="text-[11px] text-[#64748b]">Add a single contact manually</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-[#64748b] transition-colors hover:bg-[#1a1d27] hover:text-[#e2e8f0]">
                        <X size={15} />
                    </button>
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (isGuest) {
                        onRequireAuth?.();
                        return;
                    }
                    onCreate(contact);
                }} className="p-6">
                    <div className="flex flex-col gap-4">
                        {fields.map(({ key, label, placeholder, icon: Icon, required, type }) => (
                            <div key={key}>
                                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                                    {label}{required && <span className="ml-1 text-[#FB6218]">*</span>}
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]"><Icon size={14} /></span>
                                    <input type={type} required={required} placeholder={placeholder} value={contact[key]}
                                        onChange={(e) => setContact((p) => ({ ...p, [key]: e.target.value }))}
                                        className="h-10 w-full rounded-lg border border-[#23263a] bg-[#0f1117] pl-9 pr-3 text-[13px] text-[#e2e8f0] outline-none transition-[border-color] placeholder:text-[#334155] focus:border-[#FB6218]" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="cursor-pointer rounded-lg border border-[#23263a] bg-transparent px-4 py-2 text-[13px] text-[#94a3b8] hover:bg-[#1a1d27]">Cancel</button>
                        <button type="submit" disabled={creating}
                            className={cn("flex cursor-pointer items-center gap-2 rounded-lg border-none bg-gradient-to-r from-[#FB6218] to-[#FEBC02] px-5 py-2 text-[13px] font-semibold text-white shadow-md", creating && "opacity-70")}>
                            {creating && <Loader2 size={13} className="animate-spin" />}
                            {creating ? "Adding…" : "Add Contact"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

// ─── Create List Modal ────────────────────────────────────────────────────────
function CreateListModal({ onClose, contacts, numbersToShow, onCreate, creating, error }) {
    const [name, setName] = useState("");
    const [numberId, setNumberId] = useState("");
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [pickerSearch, setPickerSearch] = useState("");

    const filtered = contacts.filter((c) => {
        const q = pickerSearch.toLowerCase();
        return !q || c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q);
    });
    const toggleOne = (id) => setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const toggleAll = () => setSelectedIds(selectedIds.size === filtered.length && filtered.length > 0 ? new Set() : new Set(filtered.map((c) => c._id)));

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-[560px] flex-col rounded-2xl border border-[#23263a] bg-[#13151c] shadow-[0_32px_80px_rgba(0,0,0,0.6)]" style={{ maxHeight: "90vh" }}>
                <div className="flex shrink-0 items-center justify-between border-b border-[#23263a] px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FB6218]/20 to-[#FEBC02]/20">
                            <ListFilter size={16} className="text-[#FB6218]" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-semibold text-[#e2e8f0]">Create Contact List</h3>
                            <p className="text-[11px] text-[#64748b]">Group contacts for targeted campaigns</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-[#64748b] transition-colors hover:bg-[#1a1d27] hover:text-[#e2e8f0]">
                        <X size={15} />
                    </button>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto p-6">
                    <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                            List Name <span className="text-[#FB6218]">*</span>
                        </label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium Customers"
                            className="h-10 w-full rounded-lg border border-[#23263a] bg-[#0f1117] px-3 text-[13px] text-[#e2e8f0] outline-none transition-[border-color] placeholder:text-[#334155] focus:border-[#FB6218]" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                            WhatsApp Number <span className="text-[#FB6218]">*</span>
                        </label>
                        <div className="relative">
                            <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                            <select value={numberId} onChange={(e) => setNumberId(e.target.value)}
                                className="h-10 w-full appearance-none rounded-lg border border-[#23263a] bg-[#0f1117] pl-9 pr-8 text-[13px] text-[#e2e8f0] outline-none transition-[border-color] focus:border-[#FB6218]"
                                style={{ colorScheme: "dark" }}>
                                <option value="">Select a number…</option>
                                {numbersToShow.map((n) => (
                                    <option key={n._id} value={n._id} style={{ background: "#1a1d27", color: "#e2e8f0" }}>
                                        {n.displayName || n.phoneNumber} — {n.phoneNumber}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                        </div>
                        {numbersToShow.length === 0 && <p className="mt-1.5 text-[11px] text-[#f59e0b]">⚠ No active numbers found.</p>}
                    </div>
                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                                Contacts <span className="ml-1 font-normal normal-case text-[#475569]">({selectedIds.size} selected)</span>
                            </label>
                            {contacts.length > 0 && (
                                <button onClick={toggleAll} className="cursor-pointer border-none bg-transparent text-[11px] text-[#FB6218] hover:text-[#FEBC02]">
                                    {selectedIds.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
                                </button>
                            )}
                        </div>
                        <div className="overflow-hidden rounded-lg border border-[#23263a]">
                            <div className="relative border-b border-[#23263a] bg-[#0d0f14]">
                                <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                                <input value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)}
                                    placeholder="Search contacts…"
                                    className="h-9 w-full border-none bg-transparent pl-8 pr-3 text-[12px] text-[#e2e8f0] outline-none placeholder:text-[#334155]" />
                            </div>
                            <div className="max-h-[200px] overflow-y-auto bg-[#0f1117]">
                                {contacts.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                                        <Users size={24} className="text-[#334155]" />
                                        <p className="text-[12px] text-[#475569]">No contacts yet.</p>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <p className="py-4 text-center text-[12px] text-[#475569]">No contacts match.</p>
                                ) : filtered.map((c) => {
                                    const checked = selectedIds.has(c._id);
                                    return (
                                        <div key={c._id} onClick={() => toggleOne(c._id)}
                                            className={cn("flex cursor-pointer items-center gap-3 border-b border-[#1a1d27] px-3 py-2.5 transition-colors last:border-b-0",
                                                checked ? "bg-[#FB6218]/10" : "hover:bg-[#141720]")}>
                                            <div className={cn("flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded transition-all",
                                                checked
                                                    ? "bg-gradient-to-br from-[#FB6218] to-[#FEBC02] shadow-[0_0_0_2px_rgba(251,98,24,0.3)]"
                                                    : "border border-[#334155] bg-transparent")}>
                                                {checked && <span className="text-[10px] font-bold leading-none text-white">✓</span>}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className={cn("truncate text-[13px] text-[#e2e8f0]", checked && "font-medium")}>{c.name || "—"}</div>
                                                <div className="font-mono text-[11px] text-[#64748b]">{c.phone}</div>
                                            </div>
                                            {c.optedOut && <span className="rounded bg-[#2d1515] px-1.5 py-px text-[10px] text-[#f87171]">opted out</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-[#4b1d1d] bg-[#2d1515] px-3 py-2">
                            <AlertCircle size={13} className="shrink-0 text-[#f87171]" />
                            <p className="text-[12px] text-[#f87171]">{error}</p>
                        </div>
                    )}
                </div>
                <div className="flex shrink-0 justify-end gap-2 border-t border-[#23263a] px-6 py-4">
                    <button onClick={onClose} className="cursor-pointer rounded-lg border border-[#23263a] bg-transparent px-4 py-2 text-[13px] text-[#94a3b8] hover:bg-[#1a1d27]">Cancel</button>
                    <button onClick={() => onCreate({ name, numberId, contactIds: [...selectedIds] })}
                        disabled={creating || !name.trim() || !numberId}
                        className={cn("flex cursor-pointer items-center gap-2 rounded-lg border-none bg-gradient-to-r from-[#FB6218] to-[#FEBC02] px-5 py-2 text-[13px] font-semibold text-white shadow-md transition-opacity",
                            (creating || !name.trim() || !numberId) && "cursor-not-allowed opacity-50")}>
                        {creating && <Loader2 size={13} className="animate-spin" />}
                        {creating ? "Creating…" : "Create List"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MetaWhatsappContact() { 
    const [tab, setTab] = useState("contacts");
    const [search, setSearch] = useState("");
    const [showImport, setShowImport] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showCreateList, setShowCreateList] = useState(false);
    const [listError, setListError] = useState("");
    const [creatingList, setCreatingList] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const reduxUser = useSelector((state) => state.auth?.user);
    const isGuest = Boolean(reduxUser?.isGuest);
    const openAuthModal = () => setShowAuthModal(true);
    const getId = (item) => item?._id || item?.id;

    const { data, isLoading, refetch } = useGetContactsQuery();
    const { data: listsData, refetch: refetchLists } = useGetContactListsQuery();
    const { data: numbersData } = useGetWhatsappNumberQuery();

    const [createContact, { isLoading: creating }] = useCreateContactMutation();
    const [deleteContact] = useDeleteContactMutation();
    const [updateContact] = useUpdateContactMutation();
    const [createList] = useCreateContactListMutation();
    const [deleteList] = useDeleteContactListMutation();

    const contacts = data?.data || [];
    const lists = listsData?.data || [];
    const allNumbers = numbersData?.data || [];
    const activeNumbers = allNumbers.filter((n) => ["active", "connected"].includes(n.status?.toLowerCase()));
    const numbersToShow = activeNumbers.length > 0 ? activeNumbers : allNumbers;

    const filteredContacts = contacts.filter((c) => {
        const q = search.toLowerCase();
        return !q || c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    });

    const handleCreateContact = async (contactData) => {
        try { await createContact(contactData).unwrap(); setShowAddContact(false); refetch(); } catch { }
    };

    const handleCreateList = async ({ name, numberId, contactIds }) => {
        if (!name.trim()) { setListError("Please enter a list name"); return; }
        if (!numberId) { setListError("Please select a WhatsApp number"); return; }
        setCreatingList(true); setListError("");
        try { await createList({ name, numberId, contactIds }).unwrap(); setShowCreateList(false); refetchLists(); }
        catch (err) { setListError(err.data?.message || "Failed to create list"); }
        finally { setCreatingList(false); }
    };

    const handleDeleteList = async (id) => {
        try { await deleteList(id).unwrap(); refetchLists(); } catch { }
    };

    const handleDeleteContact = async (id) => {
        try { await deleteContact(id).unwrap(); refetch(); } catch { }
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        if (confirmDelete.type === "contact") {
            await handleDeleteContact(confirmDelete.id);
            return;
        }
        if (confirmDelete.type === "list") {
            await handleDeleteList(confirmDelete.id);
        }
    };

    return (
        <div className="flex h-full flex-col overflow-hidden bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-[#e2e8f0]">
            <style>{`
                .wa-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .wa-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
                    border-radius: 999px;
                }
                .wa-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .wa-scrollbar { scrollbar-color: #10b981 transparent; scrollbar-width: thin; }
            `}</style>

            {showImport && (
                <ImportModal
                    onClose={() => { setShowImport(false); refetch(); }}
                    isGuest={isGuest}
                    onRequireAuth={openAuthModal}
                />
            )}
            {showAddContact && (
                <AddContactModal
                    onClose={() => setShowAddContact(false)}
                    onCreate={handleCreateContact}
                    creating={creating}
                />
            )}
            {showCreateList && (
                <CreateListModal
                    onClose={() => { setShowCreateList(false); setListError(""); }}
                    contacts={contacts} numbersToShow={numbersToShow}
                    onCreate={handleCreateList} creating={creatingList} error={listError}
                />
            )}
            <ConfirmDialog
                open={Boolean(confirmDelete)}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleConfirmDelete}
                headerText={confirmDelete?.type === "list" ? "Delete List?" : "Delete Contact?"}
                confirmText="Delete"
                message={
                    confirmDelete?.type === "list"
                        ? `Are you sure you want to delete ${confirmDelete?.name ? `"${confirmDelete.name}"` : "this list"}? This action cannot be undone.`
                        : `Are you sure you want to delete ${confirmDelete?.name ? `"${confirmDelete.name}"` : "this contact"}? This action cannot be undone.`
                }
            />
            {showAuthModal && (
                <DemoAnimatedAuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                >
                    <AuthPage onSuccess={() => setShowAuthModal(false)} />
                </DemoAnimatedAuthModal>
            )}

            {/* ── Header ── */}
            <div className="px-6 pb-0 pt-6">
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h1 className="m-0 text-xl font-bold text-slate-900 dark:text-[#f1f5f9]">Contacts</h1>
                        <p className="mt-1 text-[13px] text-slate-500 dark:text-[#64748b]">Manage contacts and lists for your campaigns</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowImport(true)}
                            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 dark:border-[#23263a] bg-white dark:bg-transparent px-3.5 py-2 text-[13px] text-slate-700 dark:text-[#94a3b8] transition-colors hover:border-slate-400 dark:hover:border-[#334155] hover:text-slate-900 dark:hover:text-[#e2e8f0]">
                            <Upload size={13} /> Import
                        </button>
                        {tab === "contacts" ? (
                            <button onClick={() => setShowAddContact(true)}
                                className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-md transition-opacity">
                                <Plus size={13} /> Add Contact
                            </button>
                        ) : (
                            <button onClick={() => setShowCreateList(true)}
                                className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-md transition-opacity">
                                <Plus size={13} /> Create List
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-5 grid grid-cols-4 gap-3">
                    {[
                        { label: "Total Contacts", value: contacts.length, color: "text-emerald-600 dark:text-[#4ade80]", bg: "bg-emerald-50 dark:bg-[#4ade80]/5", border: "border-emerald-200 dark:border-[#4ade80]/20" },
                        { label: "Reachable", value: contacts.filter((c) => !c.optedOut).length, color: "text-emerald-600 dark:text-[#4ade80]", bg: "bg-emerald-50 dark:bg-[#4ade80]/5", border: "border-emerald-200 dark:border-[#4ade80]/20" },
                        { label: "Opted Out", value: contacts.filter((c) => c.optedOut).length, color: "text-red-600 dark:text-[#f87171]", bg: "bg-red-50 dark:bg-[#f87171]/5", border: "border-red-200 dark:border-[#f87171]/20" },
                        { label: "Contact Lists", value: lists.length, color: "text-blue-600 dark:text-[#60a5fa]", bg: "bg-blue-50 dark:bg-[#60a5fa]/5", border: "border-blue-200 dark:border-[#60a5fa]/20" },
                    ].map((s, i) => (
                        <div key={i} className={cn("rounded-xl border p-4 shadow-sm bg-white dark:bg-[#13151c]", s.border)}>
                            <p className="m-0 text-[11px] text-slate-500 dark:text-[#64748b]">{s.label}</p>
                            <p className={cn("m-0 mt-1.5 text-2xl font-bold", s.color)}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#23263a]">
                    {[["contacts", "Contacts", contacts.length], ["lists", "Contact Lists", lists.length]].map(([id, label, count]) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={cn(
                                "-mb-px cursor-pointer border-none bg-transparent px-5 py-2.5 text-[13px] font-medium transition-colors",
                                tab === id
                                    ? "border-b-2 border-[#FB6218] text-[#FB6218]"
                                    : "border-b-2 border-transparent text-[#64748b] hover:text-[#94a3b8]"
                            )}>
                            {label}
                            <span className={cn("ml-2 rounded-full px-1.5 py-px text-[10px]",
                                tab === id ? "bg-[#FB6218]/20 text-[#FEBC02]" : "bg-[#1a1d27] text-[#475569]"
                            )}>{count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content Panel ── */}
            <div className={cn(
                "mx-6 mb-6 mt-0 flex flex-1 flex-col overflow-hidden border border-[#23263a] bg-[#1a1d27]",
                tab === "contacts" ? "rounded-tr-xl rounded-b-xl" : "rounded-tl-xl rounded-b-xl"
            )}>
                {tab === "contacts" ? (
                    <>
                        <div className="border-b border-[#23263a] bg-[#13151c] px-4 py-2.5">
                            <div className="relative w-[280px]">
                                <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                                <input value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, phone, email…"
                                    className="h-9 w-full rounded-md border border-[#23263a] bg-[#0f1117] pl-8 pr-3 text-[13px] text-[#e2e8f0] outline-none placeholder:text-[#334155] focus:border-[#FB6218]" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2 p-8 text-[#64748b]">
                                    <Loader2 size={16} className="animate-spin" /> Loading…
                                </div>
                            ) : filteredContacts.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 p-12 text-center">
                                    <Users size={36} className="text-[#334155]" />
                                    <p className="text-[13px] text-[#64748b]">
                                        {search ? "No contacts match your search." : "No contacts yet. Add or import contacts to get started."}
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full border-collapse text-[13px]">
                                    <thead>
                                        <tr className="border-b border-[#23263a] bg-[#13151c]">
                                            {["Name", "Phone", "Email", "Tags", "Status", "Actions"].map((h) => (
                                                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748b]">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredContacts.map((c) => (
                                            <tr key={getId(c)} className="border-b border-[#1e2130] transition-colors hover:bg-[#1e2130]">
                                                <td className="px-4 py-2.5 font-medium text-[#e2e8f0]">{c.name || "—"}</td>
                                                <td className="px-4 py-2.5 font-mono text-[13px] text-[#94a3b8]">{c.phone}</td>
                                                <td className="px-4 py-2.5 text-[#64748b]">{c.email || "—"}</td>
                                                <td className="px-4 py-2.5">
                                                    {c.tags?.map((t) => (
                                                        <span key={t} className="mr-1 rounded-full bg-[#1e293b] px-[7px] py-px text-[11px] text-[#94a3b8]">{t}</span>
                                                    ))}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {c.optedOut
                                                        ? <span className="inline-flex items-center gap-1 text-[11px] text-[#f87171]"><span className="h-1.5 w-1.5 rounded-full bg-[#f87171]" />Opted out</span>
                                                        : <span className="inline-flex items-center gap-1 text-[11px] text-[#4ade80]"><span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />Active</span>}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex gap-1.5">
                                                        {!c.optedOut && (
                                                            <button onClick={() => updateContact({ id: getId(c), optedOut: true })}
                                                                className="cursor-pointer rounded border border-[#23263a] bg-transparent px-2 py-1 text-[11px] text-[#94a3b8] transition-colors hover:border-[#334155] hover:text-[#e2e8f0]">
                                                                Opt Out
                                                            </button>
                                                        )}
                                                        <button onClick={() => setConfirmDelete({ type: "contact", id: getId(c), name: c.name })}
                                                            className="cursor-pointer rounded border-none bg-[#2d1515] px-2 py-1 text-[11px] text-[#f87171] transition-colors hover:bg-[#450a0a]">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="border-t border-[#23263a] px-4 py-2 text-[11px] text-[#475569]">
                            {filteredContacts.length}{search ? ` of ${contacts.length} ` : " "}contacts
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto wa-scrollbar">
                            {lists.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 p-12 text-center">
                                    <ListFilter size={36} className="text-[#334155]" />
                                    <p className="text-[13px] text-[#64748b]">No contact lists yet.</p>
                                    <button onClick={() => setShowCreateList(true)}
                                        className="cursor-pointer rounded-lg border-none bg-gradient-to-r from-[#FB6218] to-[#FEBC02] px-4 py-2 text-[13px] font-semibold text-white shadow-md hover:opacity-90">
                                        Create your first list
                                    </button>
                                </div>
                            ) : lists.map((l) => (
                                <div key={getId(l)} className="flex items-center gap-4 border-b border-[#1e2130] px-5 py-4 transition-colors hover:bg-[#1a1e2e]">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FB6218]/20 to-[#FEBC02]/20">
                                        <Users size={16} className="text-[#FEBC02]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-[#e2e8f0]">{l.name}</div>
                                        <div className="mt-0.5 flex flex-wrap gap-3 text-[12px] text-[#64748b]">
                                            <span className="flex items-center gap-1"><Users size={10} />{l.contactCount ?? 0} contacts</span>
                                            {l.numberId && (
                                                <span className="flex items-center gap-1 text-[#FEBC02]">
                                                    <Phone size={10} />{l.numberId?.displayName || l.numberId?.phoneNumber || l.numberId}
                                                </span>
                                            )}
                                            {l.createdAt && <span>Created {new Date(l.createdAt).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => setConfirmDelete({ type: "list", id: getId(l), name: l.name })}
                                        className="cursor-pointer rounded-lg border-none bg-[#2d1515] px-3 py-1.5 text-[12px] text-[#f87171] transition-colors hover:bg-[#450a0a]">
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-[#23263a] px-4 py-2 text-[11px] text-[#475569]">{lists.length} lists</div>
                    </>
                )}
            </div>
        </div>
    );
}
