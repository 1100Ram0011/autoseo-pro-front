import { useState, useRef, useCallback, useEffect } from "react";
import { useGetTemplatesQuery, useSendWhatsappCampaignMutation } from "@/redux/apis/Templateapi";
import * as XLSX from "xlsx";

// ─── Utilities ────────────────────────────────────────────────────────────────

const escapeHtml = (str = "") =>
  str.replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])
  );

const splitCSV = (row) =>
  row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((c) =>
    c.replace(/^"|"$/g, "").trim()
  ) || [];

const isValidPhone = (num) => /^[1-9]\d{7,14}$/.test(String(num).trim());

const parseBody = (body) => {
  if (!body) return [];
  const matches = [...body.matchAll(/\{\{(\d+)\}\}/g)];
  return [...new Set(matches.map((m) => parseInt(m[1])))].sort((a, b) => a - b);
};

const renderPreview = (body, values) => {
  if (!body) return "";
  return body.replace(/\{\{(\d+)\}\}/g, (_, n) => {
    const val = values[`body_${n}`];
    return val && val.trim()
      ? `<span style="color:#25D366;font-weight:600">${escapeHtml(val)}</span>`
      : `<span style="color:#aaa;font-style:italic">{{${n}}}</span>`;
  });
};

// ─── File Parsers ─────────────────────────────────────────────────────────────

const parseCSVText = (text, isFirstRowHeader) => {
  const lines = text.split("\n").filter((r) => r.trim());
  if (!lines.length) return { columns: [], rows: [] };
  if (isFirstRowHeader) {
    const columns = splitCSV(lines[0]);
    const rows = lines.slice(1).map((r) => {
      const cells = splitCSV(r);
      return Object.fromEntries(columns.map((col, i) => [col, cells[i] || ""]));
    });
    return { columns, rows };
  } else {
    const firstRow = splitCSV(lines[0]);
    const columns = firstRow.map((_, i) => String.fromCharCode(65 + i));
    const rows = lines.map((r) => {
      const cells = splitCSV(r);
      return Object.fromEntries(columns.map((col, i) => [col, cells[i] || ""]));
    });
    return { columns, rows };
  }
};

const parseExcelBuffer = (buffer, isFirstRowHeader) => {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (isFirstRowHeader) {
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const columns = json.length > 0 ? Object.keys(json[0]) : [];
    return { columns, rows: json };
  } else {
    const arr = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!arr.length) return { columns: [], rows: [] };
    const maxCols = Math.max(...arr.map((r) => r.length));
    const columns = Array.from({ length: maxCols }, (_, i) => String.fromCharCode(65 + i));
    const rows = arr.map((r) =>
      Object.fromEntries(columns.map((col, i) => [col, r[i] ?? ""]))
    );
    return { columns, rows };
  }
};

const ACCEPTED_EXTENSIONS = ".csv,.xlsx,.xls";
const isExcelFile = (file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

// ─── Sub-components ───────────────────────────────────────────────────────────

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-full border-none text-[13px] cursor-pointer transition-all duration-200 font-sans ${active ? "bg-[#1a1a2e] text-white font-semibold" : "bg-transparent text-gray-500 font-normal"
      }`}
  >
    {children}
  </button>
);

const Label = ({ children, required }) => (
  <label className="block text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-1.5 font-sans">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const SelectField = ({ value, onChange, options = [], placeholder = "Select", loading = false }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        onClick={() => !loading && setOpen((p) => !p)}
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-gray-200 bg-gray-50 text-sm font-sans transition-colors ${loading ? "cursor-not-allowed" : "cursor-pointer"
          } ${selected ? "text-[#1a1a2e]" : "text-gray-400"}`}
      >
        <span>{loading ? "Loading..." : selected ? selected.label : placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border-[1.5px] border-gray-200 rounded-[10px] shadow-xl z-50 max-h-56 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3.5 py-3 text-gray-400 text-sm font-sans">No options available</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`px-3.5 py-2.5 cursor-pointer text-sm font-sans hover:bg-indigo-50 transition-colors ${String(opt.value) === String(value) ? "bg-indigo-50" : ""
                  }`}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const CSVMappingField = ({ variables, csvColumns, mapping, onChange }) => (
  <div className="flex flex-col gap-3">
    {variables.map((varNum) => {
      const key = `body_${varNum}`;
      const csvCols = csvColumns.map((c, i) => ({
        value: c,
        label: `${String.fromCharCode(65 + i)} (${c})`,
      }));
      return (
        <div key={key}>
          <Label required>{key}</Label>
          <SelectField
            value={mapping[key] || ""}
            onChange={(val) => onChange(key, val)}
            options={[{ value: "__custom__", label: "Custom Value" }, ...csvCols]}
            placeholder={`Map ${key} to column`}
          />
          {mapping[key] === "__custom__" && (
            <input
              placeholder={`Enter custom value for ${key}`}
              value={mapping[`${key}_custom`] || ""}
              onChange={(e) => onChange(`${key}_custom`, e.target.value)}
              className="mt-2 w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-gray-200 font-sans text-sm outline-none box-border focus:border-indigo-500 transition-colors"
            />
          )}
        </div>
      );
    })}
  </div>
);

const WhatsAppPreview = ({ fromNumber, template, bodyValues }) => {
  const previewHTML = template ? renderPreview(template.body, bodyValues) : "";
  return (
    <div className="w-full max-w-[280px] rounded-2xl overflow-hidden shadow-lg font-sans" style={{ background: "#ece5dd" }}>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5" style={{ background: "#075e54" }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#25d366" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.7 0 5-2.3 5-5S14.7 2 12 2 7 4.3 7 7s2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[13px] font-semibold truncate">{fromNumber || "Select a number"}</div>
          <div className="text-[11px]" style={{ color: "#b2dfdb" }}>online</div>
        </div>
        <div className="flex gap-3 shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.5a16 16 0 006.59 6.59l1.36-1.36a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </div>
      </div>
      <div className="p-3.5 min-h-[180px]" style={{ background: "#ece5dd" }}>
        {template ? (
          <div
            className="bg-white rounded-[0_10px_10px_10px] px-3 py-2.5 max-w-[90%] shadow-sm text-[13px] leading-relaxed text-[#1a1a1a] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        ) : (
          <div className="flex items-center justify-center h-[120px] text-gray-400 text-[13px] text-center">
            Select a template to preview
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-2.5 py-2 bg-[#f0f0f0]">
        <div className="flex-1 bg-white rounded-full px-3 py-2 text-xs text-gray-300">Type a message</div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#25d366" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const FileTypeBadge = ({ file }) => {
  const isExcel = isExcelFile(file);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold font-sans border ${isExcel ? "bg-green-50 text-green-700 border-green-300" : "bg-blue-50 text-blue-700 border-blue-300"
      }`}>
      {isExcel ? "EXCEL" : "CSV"}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WaCampaignModal({
  open,
  onClose,
  onSuccess,
  selectedNumber,
  wabaNumbers = [],
}) {
  const [tab, setTab] = useState("manual");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [manualNumbers, setManualNumbers] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvColumns, setCsvColumns] = useState([]);
  const [phoneColumn, setPhoneColumn] = useState("");
  const [isFirstRowHeader, setIsFirstRowHeader] = useState(true);
  const [fromNumber, setFromNumber] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [bodyValues, setBodyValues] = useState({});
  const [csvMapping, setCsvMapping] = useState({});
  const [fileParseError, setFileParseError] = useState("");

  const fileRef = useRef();

  const {
    data: apiTemplates,
    isLoading: templatesLoading,
    isError: templatesIsError,
    refetch,
  } = useGetTemplatesQuery(selectedNumber, { skip: !selectedNumber || !open });

  useEffect(() => {
    if (!apiTemplates) return;
    const raw = Array.isArray(apiTemplates) ? apiTemplates : apiTemplates.templates || [];
    setTemplates(raw.map((t) => ({ value: t._id, label: t.name, template: t })));
  }, [apiTemplates]);

  useEffect(() => {
    if (wabaNumbers.length > 0 && !fromNumber) {
      const first = wabaNumbers[0];
      setFromNumber(typeof first === "string" ? first : first.value);
    }
  }, [wabaNumbers]);

  useEffect(() => {
    if (!open) {
      setTab("manual"); setStep(1); setError(""); setSuccess("");
      setManualNumbers(""); setCsvFile(null); setCsvData([]); setCsvColumns([]);
      setPhoneColumn(""); setIsFirstRowHeader(true);
      setFromNumber(wabaNumbers?.[0]?.value || wabaNumbers?.[0] || "");
      setSelectedTemplateId(""); setSelectedTemplate(null);
      setBodyValues({}); setCsvMapping({}); setFileParseError("");
    }
  }, [open]);

  useEffect(() => {
    if (csvFile) handleFile(csvFile);
  }, [isFirstRowHeader]);

  const handleRefetchTemplates = useCallback(() => {
    if (selectedNumber) refetch();
  }, [refetch, selectedNumber]);

  // ─── All hooks above ───────────────────────────────────────────────────────

  const variables = selectedTemplate ? parseBody(selectedTemplate.body) : [];

  const normalizedWabaNumbers = wabaNumbers?.map((n) =>
    typeof n === "string" ? { value: n, label: n } : { value: String(n.value), label: n.value }
  );

  const handleFile = (file) => {
    if (!file) return;
    setCsvFile(file);
    setFileParseError("");
    setPhoneColumn("");
    setCsvColumns([]);
    setCsvData([]);
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const { columns, rows } = parseCSVText(e.target.result, isFirstRowHeader);
          setCsvColumns(columns); setCsvData(rows);
        } catch { setFileParseError("Failed to parse CSV file. Please check the file format."); }
      };
      reader.onerror = () => setFileParseError("Failed to read the file.");
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const { columns, rows } = parseExcelBuffer(new Uint8Array(e.target.result), isFirstRowHeader);
          setCsvColumns(columns); setCsvData(rows);
        } catch { setFileParseError("Failed to parse Excel file. Please ensure it's a valid .xlsx or .xls file."); }
      };
      reader.onerror = () => setFileParseError("Failed to read the file.");
      reader.readAsArrayBuffer(file);
    } else {
      setFileParseError("Unsupported file type. Please upload a CSV or Excel file.");
    }
  };

  const handleTemplateSelect = (id) => {
    setSelectedTemplateId(id);
    const found = templates.find((t) => t.value === id);
    setSelectedTemplate(found ? found.template : null);
    setBodyValues({}); setCsvMapping({});
  };

  const updateBodyValue = (key, val) => setBodyValues((p) => ({ ...p, [key]: val }));
  const updateCsvMapping = (key, val) => setCsvMapping((p) => ({ ...p, [key]: val }));

  const buildRecipients = () => {
    if (tab === "manual") {
      return manualNumbers.split(",").map((n) => n.trim()).filter(isValidPhone).map((phone) => ({ phone, values: bodyValues }));
    }
    if (tab === "csv") {
      return csvData.map((row) => {
        const phone = String(row[phoneColumn] || "").trim();
        if (!isValidPhone(phone)) return null;
        const vals = {};
        variables.forEach((n) => {
          const key = `body_${n}`;
          const mapped = csvMapping[key];
          if (mapped === "__custom__") vals[key] = csvMapping[`${key}_custom`] || "";
          else if (mapped) vals[key] = String(row[mapped] || "");
        });
        return { phone, values: vals };
      }).filter(Boolean);
    }
    return [];
  };

  const recipients = buildRecipients();

  const validateStep1 = () => {
    if (!fromNumber) return "Please select a From number";
    if (!selectedTemplateId) return "Please select a WhatsApp template";
    if (tab === "manual" && !manualNumbers.trim()) return "Please enter at least one mobile number";
    if (tab === "csv") {
      if (!csvFile) return "Please upload a CSV or Excel file";
      if (fileParseError) return fileParseError;
      if (!phoneColumn) return "Please select the phone column";
    }
    for (const n of variables) {
      const key = `body_${n}`;
      if (tab === "manual" && !bodyValues[key]?.trim()) return `Please fill in body_${n}`;
      if (tab === "csv") {
        const mapped = csvMapping[key];
        if (!mapped) return `Please map body_${n} to a column`;
        if (mapped === "__custom__" && !csvMapping[`${key}_custom`]?.trim())
          return `Please enter a custom value for body_${n}`;
      }
    }
    return null;
  };

  const [sendCampaign, { isLoading: sending }] = useSendWhatsappCampaignMutation();

  const handleSend = async () => {
    setError(""); setSuccess("");
    try {
      const payload = {
        fromNumber, templateId: selectedTemplateId,
        templateMsg91TemplateId: selectedTemplate?.msg91TemplateId,
        templateName: selectedTemplate?.name,
        totalRecipients: recipients.length,
        recipients: recipients.map((r) => ({ phone: r.phone, variables: r.values })),
      };
      const response = await sendCampaign(payload).unwrap();
      setSuccess(`Campaign sent successfully! ${response?.sent || recipients.length} messages dispatched.`);
      onSuccess?.(response);
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to send campaign");
    }
  };

  const csvPreviewValues = (() => {
    const vals = {};
    if (csvData.length > 0) {
      variables.forEach((n) => {
        const key = `body_${n}`;
        const mapped = csvMapping[key];
        if (mapped === "__custom__") vals[key] = csvMapping[`${key}_custom`] || "";
        else if (mapped) vals[key] = String(csvData[0]?.[mapped] || "");
      });
    }
    return vals;
  })();

  if (!open) return null;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes waSlideUp {
          from { opacity:0; transform:translateY(30px) scale(.97) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
        @keyframes waSpin {
          from { transform:rotate(0deg) }
          to   { transform:rotate(360deg) }
        }
        .wa-modal-anim { animation: waSlideUp .3s cubic-bezier(.16,1,.3,1); }
        .wa-spin { animation: waSpin 1s linear infinite; }
        .wa-scrollbar::-webkit-scrollbar { width: 5px; }
        .wa-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .wa-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
        .wa-drop-zone:hover { border-color: #6366f1 !important; background: #f5f5ff !important; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[999] flex items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Modal */}
        <div className="wa-modal-anim bg-white rounded-3xl w-[max(920px,90vw)] max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,.2)]">
          <div className="wa-scrollbar flex flex-col flex-1 overflow-hidden">

            {/* Header */}
            <div className="px-7 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#1a1a2e] m-0" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Send WhatsApp Message
                </h2>
                {step === 2 && (
                  <p className="mt-1 text-[13px] text-gray-400 font-sans m-0">
                    Review before sending — {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="border-none bg-gray-100 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="wa-scrollbar flex-1 overflow-y-auto px-7 py-6">

              {/* Success */}
              {success ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="text-lg font-bold text-[#1a1a2e]" style={{ fontFamily: "'Sora', sans-serif" }}>Campaign Sent!</div>
                  <div className="text-sm text-gray-500 font-sans">{success}</div>
                  <button
                    onClick={onClose}
                    className="mt-2 px-7 py-2.5 rounded-full border-none bg-[#1a1a2e] text-white font-sans font-semibold cursor-pointer text-sm hover:bg-[#2d2d4e] transition-colors"
                  >
                    Close
                  </button>
                </div>

              ) : step === 1 ? (
                /* Step 1: Compose */
                <div className="flex gap-7">

                  {/* Left form */}
                  <div className="flex-1 flex flex-col gap-5 min-w-0">

                    {/* To */}
                    <div>
                      <Label>To</Label>
                      <div className="flex gap-1.5 bg-gray-100 rounded-full p-1 w-fit">
                        {[
                          { key: "manual", label: "Enter manually" },
                          { key: "csv", label: "Upload file" },
                        ].map((t) => (
                          <TabBtn key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
                            {t.label}
                          </TabBtn>
                        ))}
                      </div>

                      <div className="mt-3.5">
                        {tab === "manual" && (
                          <>
                            <Label required>Mobile Numbers</Label>
                            <textarea
                              value={manualNumbers}
                              onChange={(e) => setManualNumbers(e.target.value)}
                              placeholder="91989XXXXXX0,91978XXXXXX9,91924XXXXXX8"
                              rows={3}
                              className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-gray-200 font-sans text-[13px] resize-y outline-none box-border bg-gray-50 text-[#1a1a2e] focus:border-indigo-500 transition-colors"
                            />
                            <p className="mt-1.5 text-xs text-gray-400 font-sans m-0">
                              Enter comma-separated numbers <strong>with country code</strong> excluding '+'
                            </p>
                          </>
                        )}

                        {tab === "csv" && (
                          <>
                            {!csvFile ? (
                              <div
                                className="wa-drop-zone border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
                                onClick={() => fileRef.current.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const f = e.dataTransfer.files[0];
                                  if (f) handleFile(f);
                                }}
                              >
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" className="mx-auto mb-3 block">
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="12" y1="18" x2="12" y2="12" />
                                  <line x1="9" y1="15" x2="15" y2="15" />
                                </svg>
                                <p className="font-sans text-sm font-medium text-gray-600 mb-1.5 m-0">
                                  Click to upload or drag & drop
                                </p>
                                <p className="font-sans text-xs text-gray-400 mb-3 m-0">
                                  Supported formats:{" "}
                                  <strong className="text-indigo-500">.csv, .xlsx, .xls</strong>
                                </p>
                                <div className="flex gap-2 justify-center">
                                  {["CSV", "XLSX", "XLS"].map((fmt) => (
                                    <span
                                      key={fmt}
                                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-sans border ${fmt === "CSV"
                                          ? "bg-blue-50 text-blue-700 border-blue-300"
                                          : "bg-green-50 text-green-700 border-green-300"
                                        }`}
                                    >
                                      {fmt}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 rounded-[10px] px-4 py-3 flex items-center gap-2.5">
                                <svg
                                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                                  stroke={isExcelFile(csvFile) ? "#1e7e34" : "#6366f1"} strokeWidth="2"
                                >
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span className="font-sans text-[13px] flex-1 text-[#1a1a2e] overflow-hidden text-ellipsis whitespace-nowrap">
                                  {csvFile.name}
                                </span>
                                <FileTypeBadge file={csvFile} />
                                <div className="flex gap-2">
                                  <button onClick={() => fileRef.current.click()} className="border-none bg-transparent cursor-pointer text-xs text-indigo-500 font-sans hover:underline">
                                    Change
                                  </button>
                                  <button
                                    onClick={() => { setCsvFile(null); setCsvData([]); setCsvColumns([]); setPhoneColumn(""); setFileParseError(""); }}
                                    className="border-none bg-transparent cursor-pointer text-xs text-red-500 font-sans hover:underline"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}

                            <input
                              ref={fileRef}
                              type="file"
                              accept={ACCEPTED_EXTENSIONS}
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files[0];
                                if (f) handleFile(f);
                                e.target.value = "";
                              }}
                            />

                            {fileParseError && (
                              <div className="mt-2.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-xs font-sans">
                                {fileParseError}
                              </div>
                            )}

                            {csvFile && csvData.length > 0 && !fileParseError && (
                              <>
                                <div className="mt-3 overflow-x-auto rounded-[10px] border border-gray-200 max-h-40 overflow-y-auto">
                                  <table className="w-full border-collapse font-sans text-xs">
                                    <thead className="sticky top-0">
                                      <tr className="bg-gray-100">
                                        {csvColumns.map((col) => (
                                          <th key={col} className="px-3 py-2 text-left text-gray-500 font-semibold whitespace-nowrap">
                                            {col}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {csvData.map((row, i) => (
                                        <tr key={i} className="border-t border-gray-50">
                                          {csvColumns.map((col) => (
                                            <td key={col} className="px-3 py-1.5 text-[#1a1a2e] whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">
                                              {row[col] !== undefined && row[col] !== "" ? (
                                                String(row[col])
                                              ) : (
                                                <span className="text-gray-300">—</span>
                                              )}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <p className="mx-3 my-2 text-[11px] text-gray-400">
                                    Showing {csvData.length} rows
                                  </p>
                                </div>

                                <div className="flex gap-3.5 items-end mt-3">
                                  <div className="flex-1">
                                    <Label required>Select Mobile Column</Label>
                                    <SelectField
                                      value={phoneColumn}
                                      onChange={setPhoneColumn}
                                      options={csvColumns.map((c) => ({ value: c, label: c }))}
                                      placeholder="Select phone column"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 pb-0.5">
                                    <div
                                      onClick={() => setIsFirstRowHeader((p) => !p)}
                                      className={`w-10 h-[22px] rounded-full cursor-pointer relative transition-colors duration-200 ${isFirstRowHeader ? "bg-[#25d366]" : "bg-gray-300"}`}
                                    >
                                      <div
                                        className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200 ${isFirstRowHeader ? "left-[22px]" : "left-0.5"}`}
                                      />
                                    </div>
                                    <span className="font-sans text-[13px] text-gray-500 whitespace-nowrap">
                                      First row is header
                                    </span>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* From */}
                    <div>
                      <Label required>From</Label>
                      <SelectField
                        value={fromNumber}
                        onChange={setFromNumber}
                        options={normalizedWabaNumbers}
                        placeholder="Select Number"
                      />
                    </div>

                    {/* Template */}
                    <div>
                      <Label required>WhatsApp Template</Label>
                      {templatesIsError && (
                        <div className="mb-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-xs font-sans">
                          Failed to load templates — click ↻ to retry
                        </div>
                      )}
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <SelectField
                            value={selectedTemplateId}
                            onChange={handleTemplateSelect}
                            options={templates}
                            placeholder={
                              !selectedNumber ? "No number provided"
                                : templatesLoading ? "Loading templates..."
                                  : templates.length === 0 ? "No approved templates found — click ↻"
                                    : "Select WhatsApp Template"
                            }
                            loading={templatesLoading}
                          />
                        </div>
                        <button
                          onClick={handleRefetchTemplates}
                          title="Refresh templates"
                          disabled={!selectedNumber || templatesLoading}
                          className={`w-10 h-10 border-[1.5px] border-gray-200 rounded-[10px] bg-gray-50 flex items-center justify-center shrink-0 transition-opacity ${!selectedNumber || templatesLoading ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-gray-100"
                            }`}
                        >
                          <svg
                            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"
                            className={templatesLoading ? "wa-spin" : ""}
                          >
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Variable Mapping */}
                    {selectedTemplate && variables.length > 0 && (
                      <div>
                        <Label>Variable Mapping</Label>
                        {tab === "manual" ? (
                          <div className="flex flex-col gap-3">
                            {variables.map((n) => {
                              const key = `body_${n}`;
                              return (
                                <div key={key}>
                                  <Label required>{key}</Label>
                                  <input
                                    value={bodyValues[key] || ""}
                                    onChange={(e) => updateBodyValue(key, e.target.value)}
                                    placeholder={`Enter ${key} Value`}
                                    className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-gray-200 font-sans text-sm outline-none box-border bg-gray-50 focus:border-indigo-500 transition-colors"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <CSVMappingField variables={variables} csvColumns={csvColumns} mapping={csvMapping} onChange={updateCsvMapping} />
                        )}
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-[10px] px-3.5 py-2.5 text-red-600 text-[13px] font-sans">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Right: Preview */}
                  <div className="w-[280px] shrink-0">
                    <Label>Template Preview</Label>
                    <div className="mt-1.5">
                      <WhatsAppPreview
                        fromNumber={fromNumber}
                        template={selectedTemplate}
                        bodyValues={tab === "manual" ? bodyValues : csvPreviewValues}
                      />
                    </div>
                  </div>
                </div>

              ) : (
                /* Step 2: Review */
                <div>
                  <div className="grid grid-cols-3 gap-3.5 mb-5">
                    {[
                      { label: "Recipients", value: recipients.length },
                      { label: "From Number", value: fromNumber },
                      { label: "Template", value: selectedTemplate?.name || "—" },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="font-sans text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                          {item.label}
                        </div>
                        <div className="text-lg font-bold text-[#1a1a2e] mt-1 truncate" style={{ fontFamily: "'Sora', sans-serif" }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <Label>All Recipients</Label>
                    <span className="text-[11px] text-gray-400 font-sans font-medium bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {recipients.length} total
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Sticky-header scroll container */}
                    <div className="wa-scrollbar overflow-y-auto max-h-[320px]">
                      <table className="w-full border-collapse font-sans text-[13px]">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-gray-100 shadow-[0_1px_0_#e5e7eb]">
                            <th className="px-3.5 py-2.5 text-left text-gray-500 font-semibold whitespace-nowrap">#</th>
                            <th className="px-3.5 py-2.5 text-left text-gray-500 font-semibold whitespace-nowrap">Phone</th>
                            {variables.map((n) => (
                              <th key={n} className="px-3.5 py-2.5 text-left text-gray-500 font-semibold whitespace-nowrap">body_{n}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {recipients?.map((r, i) => (
                            <tr key={i} className={`border-t border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                              <td className="px-3.5 py-2.5 text-gray-400 text-xs font-medium">{i + 1}</td>
                              <td className="px-3.5 py-2.5 text-[#1a1a2e] font-mono text-[12px]">{r.phone}</td>
                              {variables.map((n) => (
                                <td key={n} className="px-3.5 py-2.5 text-[#1a1a2e]">
                                  {r.values[`body_${n}`] || <span className="text-gray-300">—</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-[10px] px-3.5 py-2.5 text-red-600 text-[13px] font-sans">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="px-7 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  {step === 1 && selectedTemplate && tab === "manual" && (
                    <button
                      onClick={() => {
                        const defaults = {};
                        variables.forEach((n) => { defaults[`body_${n}`] = `Variable ${n}`; });
                        setBodyValues(defaults);
                      }}
                      className="border-[1.5px] border-gray-200 bg-transparent px-4 py-2 rounded-full font-sans text-[13px] cursor-pointer text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Create Default Variable
                    </button>
                  )}
                </div>
                <div className="flex gap-2.5">
                  {step === 2 && (
                    <button
                      onClick={() => { setStep(1); setError(""); }}
                      className="border-[1.5px] border-gray-200 bg-transparent px-5 py-2.5 rounded-full font-sans text-sm cursor-pointer text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="border-[1.5px] border-gray-200 bg-transparent px-5 py-2.5 rounded-full font-sans text-sm cursor-pointer text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {step === 1 ? (
                    <button
                      onClick={() => {
                        const err = validateStep1();
                        if (err) { setError(err); return; }
                        setError("");
                        setStep(2);
                      }}
                      className="border-none bg-[#1a1a2e] text-white px-6 py-2.5 rounded-full font-sans text-sm font-semibold cursor-pointer hover:bg-[#2d2d4e] transition-colors"
                    >
                      Review & Send →
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className={`border-none text-white px-6 py-2.5 rounded-full font-sans text-sm font-semibold flex items-center gap-2 transition-colors ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-[#25d366] cursor-pointer hover:bg-[#1fb558]"
                        }`}
                    >
                      {sending && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="wa-spin">
                          <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                          <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                        </svg>
                      )}
                      {sending ? "Sending..." : `Send to ${recipients.length} Recipients`}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}