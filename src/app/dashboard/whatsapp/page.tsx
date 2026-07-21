"use client";

import { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  LogOut,
  LogIn,
  CheckCircle2,
  WifiOff,
  Upload,
  Download,
  Loader2,
  FileSpreadsheet,
  X,
} from "lucide-react";


// Ensure that API uses fetch from backend (/api/whatsapp)
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token") || "";
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`
  };
  return fetch(url, { ...options, headers });
};

export default function WhatsAppAutomationPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState("PENDING");
  const [connectLoading, setConnectLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [testNumber, setTestNumber] = useState("");
  const [checkingNumber, setCheckingNumber] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);

  const [validationFile, setValidationFile] = useState<File | null>(null);
  const [uploadingValidationFile, setUploadingValidationFile] = useState(false);
  const [validationJobId, setValidationJobId] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<any>(null);

  const pollIntervalRef = useRef<any>(null);
  const qrPollRef = useRef<any>(null);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const fetchConnections = async () => {
    try {
      setConnectionsLoading(true);
      // Dummy accountId is derived from backend middleware now, so we just pass "default" 
      const res = await fetchWithAuth(`${backendUrl}/whatsapp/connections/default`);
      const data = await res.json();
      if (data?.data) {
        setConnections(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConnectionsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (validationJobId) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetchWithAuth(`${backendUrl}/whatsapp/validator/status/${validationJobId}`);
          const data = await res.json();
          if (data.success && data.data) {
            setValidationStatus(data.data);
            if (data.data.status === "COMPLETED" || data.data.status === "FAILED") {
              clearInterval(pollIntervalRef.current);
            }
          }
        } catch (error) {
          console.error(error);
        }
      }, 3000);
    }
    return () => clearInterval(pollIntervalRef.current);
  }, [validationJobId]);

  const handleConnect = async () => {
    try {
      setConnectLoading(true);
      const res = await fetchWithAuth(`${backendUrl}/whatsapp/connect`, { method: "POST" });
      const data = await res.json();
      if (data.data?.connectionId) {
        setIsQrModalOpen(true);
        pollQr(data.data.connectionId);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect");
    } finally {
      setConnectLoading(false);
    }
  };

  const pollQr = async (connectionId: string) => {
    qrPollRef.current = setInterval(async () => {
      try {
        const resQr = await fetchWithAuth(`${backendUrl}/whatsapp/qr/${connectionId}`);
        const dataQr = await resQr.json();
        if (dataQr.data?.qr) {
          setQrData(dataQr.data);
        }

        const resStatus = await fetchWithAuth(`${backendUrl}/whatsapp/status/${connectionId}`);
        const dataStatus = await resStatus.json();
        if (dataStatus.data?.status) {
          setConnectionStatus(dataStatus.data.status);
          if (dataStatus.data.status === "CONNECTED") {
            clearInterval(qrPollRef.current);
            setIsQrModalOpen(false);
            fetchConnections();
          } else if (dataStatus.data.status === "DISCONNECTED") {
            clearInterval(qrPollRef.current);
            alert("Connection closed by server.");
          }
        }
      } catch (error) {
        console.error(error);
      }
    }, 2000);
  };

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
    clearInterval(qrPollRef.current);
  };

  const handleLogout = async (connectionId: string) => {
    try {
      setLogoutLoading(true);
      await fetchWithAuth(`${backendUrl}/whatsapp/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId })
      });
      fetchConnections();
    } catch (error) {
      console.error(error);
      alert("Logout failed");
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleCheckNumber = async () => {
    if (!selectedConnectionId || !testNumber) {
      alert("Select connection and enter number.");
      return;
    }
    try {
      setCheckingNumber(true);
      const res = await fetchWithAuth(`${backendUrl}/whatsapp/check-number`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: selectedConnectionId, number: testNumber })
      });
      const data = await res.json();
      setCheckResult({ whatsapp: data.data?.whatsapp, number: testNumber });
    } catch (error) {
      console.error(error);
      alert("Check failed");
    } finally {
      setCheckingNumber(false);
    }
  };

  const handleValidationUpload = async () => {
    if (!validationFile) return;
    try {
      setUploadingValidationFile(true);
      const formData = new FormData();
      formData.append("file", validationFile);
      const res = await fetchWithAuth(`${backendUrl}/whatsapp/validator/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setValidationJobId(data.jobId);
        setValidationStatus({ status: "PENDING", totalRows: 0, processedRows: 0 });
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploadingValidationFile(false);
    }
  };

  const connectedConnections = connections.filter((c) => c.status === "CONNECTED");

  const statusBadge =
    connectionStatus === "CONNECTED"
      ? "text-green-600"
      : connectionStatus === "QR_READY"
      ? "text-blue-600"
      : "text-slate-600";

  return (
    <>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">WhatsApp Automation</h1>
          <p className="mt-2 text-slate-500">Manage connections and validate numbers.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-500">Accounts</h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Smartphone className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-2 text-3xl font-bold">{connections.length}</h3>
          </div>
          
          <div className="rounded-2xl border bg-white p-5 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Connected</p>
            <h3 className="mt-2 text-3xl font-bold text-green-600">
              {connectedConnections.length}
            </h3>
          </div>

          <div className="rounded-2xl border bg-white p-5 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Disconnected</p>
            <h3 className="mt-2 text-3xl font-bold text-red-600">
              {connections.length - connectedConnections.length}
            </h3>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
          <div className="border-b p-5 flex justify-between">
            <h3 className="text-lg font-semibold">Linked Accounts</h3>
            <button
              onClick={handleConnect}
              disabled={connectLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {connectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Connect Account
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Number</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {connectionsLoading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </td>
                  </tr>
                ) : connections.length ? (
                  connections.map((conn) => (
                    <tr key={conn.connectionId} className="border-b">
                      <td className="p-4 font-medium">{conn.displayName || "--"}</td>
                      <td className="p-4">{conn.linkedNumber ? `+${conn.linkedNumber}` : "--"}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          conn.status === "CONNECTED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {conn.status === "CONNECTED" ? "Connected" : "Disconnected"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {conn.status === "CONNECTED" && (
                          <button
                            onClick={() => handleLogout(conn.connectionId)}
                            disabled={logoutLoading}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500 px-3 py-2 text-sm text-red-500"
                          >
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-500">No WhatsApp Accounts Linked</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900">
            <h3 className="text-lg font-semibold">WhatsApp Number Testing</h3>
            <div className="mt-5 grid gap-3">
              <select
                value={selectedConnectionId}
                onChange={(e) => setSelectedConnectionId(e.target.value)}
                className="h-11 w-full rounded-xl border px-3"
              >
                <option value="">Select Account</option>
                {connectedConnections.map((item) => (
                  <option key={item.connectionId} value={item.connectionId}>
                    {item.displayName || item.name} (+{item.linkedNumber})
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <input
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter Mobile Number"
                  className="h-11 flex-1 rounded-xl border px-4"
                />
                <button
                  onClick={handleCheckNumber}
                  disabled={checkingNumber || !selectedConnectionId || !testNumber}
                  className="rounded-xl bg-green-600 px-5 text-white disabled:opacity-50"
                >
                  {checkingNumber ? "Checking..." : "Check"}
                </button>
              </div>
            </div>

            {checkResult && (
              <div className="mt-5 rounded-xl border p-4 flex items-center gap-3">
                {checkResult.whatsapp ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <WifiOff className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <p className="font-semibold">
                    {checkResult.whatsapp ? "WhatsApp Registered" : "WhatsApp Not Registered"}
                  </p>
                  <p className="text-sm text-slate-500">{checkResult.number}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Bulk Validation</h3>
            </div>
            <div className="space-y-4">
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={(e) => setValidationFile(e.target.files?.[0] || null)}
                className="block w-full rounded-xl border p-3"
              />
              <button
                onClick={handleValidationUpload}
                disabled={!validationFile || uploadingValidationFile}
                className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white disabled:opacity-50"
              >
                {uploadingValidationFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload & Validate
              </button>

              {validationStatus && (
                <div className="rounded-xl border p-4 bg-slate-50">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium">Status: {validationStatus.status}</span>
                    <span className="text-sm text-slate-500">
                      {validationStatus.processedRows}/{validationStatus.totalRows || "-"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{
                        width: `${validationStatus.totalRows ? (validationStatus.processedRows / validationStatus.totalRows) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  {validationStatus.error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
                      {validationStatus.error}
                    </div>
                  )}
                  {validationStatus.status === "COMPLETED" && validationStatus.downloadUrl && (
                    <a
                      href={validationStatus.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white"
                    >
                      <Download className="h-4 w-4" /> Download Result
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Connect WhatsApp</h3>
              <button onClick={handleCloseQrModal}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center">
              {qrData?.qr ? (
                <img src={qrData.qr} alt="QR Code" className="mx-auto h-72 w-72 object-contain" />
              ) : (
                <div className="h-72 w-72 mx-auto flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              <p className={`mt-4 text-sm font-medium ${statusBadge}`}>{connectionStatus}</p>
              <p className="mt-3 text-sm text-slate-500">
                Open WhatsApp → Linked Devices → Scan QR
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
