import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Server, Lock, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConnectCustomEmailMutation } from '@/redux/apis/emailConnect.api';

const RECEIVING_PROTOCOLS = [
  { value: 'none', label: 'SMTP Only (Send Only)', description: 'Only verify sending capability' },
  { value: 'imap', label: 'IMAP', description: 'Recommended for most providers' },
  { value: 'pop3', label: 'POP3', description: 'For older email systems' },
];

const DEFAULT_PORTS = {
  imap: '993',
  pop3: '995',
};

const PLACEHOLDER_HOSTS = {
  imap: 'imap.example.com',
  pop3: 'pop.example.com',
};

export default function CustomEmailModal({ isOpen, onClose }) {
  const [connectCustomEmail, { isLoading }] = useConnectCustomEmailMutation();

  const [formData, setFormData] = useState({
    email: '',
    appPassword: '',
    smtpHost: '',
    smtpPort: '465',
    receivingProtocol: 'none',
    imapHost: '',
    imapPort: '993',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When switching receiving protocol, update the default port and clear host
    if (name === 'receivingProtocol') {
      setFormData((prev) => ({
        ...prev,
        receivingProtocol: value,
        imapHost: '',
        imapPort: DEFAULT_PORTS[value] || '993',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build payload — only include receiving fields if protocol is selected
      const payload = {
        email: formData.email,
        appPassword: formData.appPassword,
        smtpHost: formData.smtpHost,
        smtpPort: formData.smtpPort,
        receivingProtocol: formData.receivingProtocol,
      };

      if (formData.receivingProtocol !== 'none') {
        payload.imapHost = formData.imapHost;
        payload.imapPort = formData.imapPort;
      }

      await connectCustomEmail(payload).unwrap();
      toast.success('Custom email connected successfully!');
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to connect custom email. Check credentials.');
    }
  };

  if (!isOpen) return null;

  const showReceivingFields = formData.receivingProtocol !== 'none';
  const protocolLabel = formData.receivingProtocol === 'pop3' ? 'POP3' : 'IMAP';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--app-pages-bg)]/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--app-pages-border)] p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--app-pages-text)]">
            <Mail className="h-6 w-6 text-slate-500" /> Connect Custom Email
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* ── Credentials ──────────────────────────────────────────── */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-pages-text)]">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@yourdomain.com"
                className="w-full rounded-lg border border-[var(--app-pages-border)] bg-transparent p-2.5 text-[var(--app-pages-text)] outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-pages-text)]">Password / App Password</label>
              <input
                type="password"
                name="appPassword"
                required
                value={formData.appPassword}
                onChange={handleChange}
                placeholder="Email password or App Password"
                className="w-full rounded-lg border border-[var(--app-pages-border)] bg-transparent p-2.5 text-[var(--app-pages-text)] outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">For standard emails, use your normal password. For Gmail/Microsoft, use a generated App Password.</p>
            </div>
          </div>

          {/* ── SMTP Settings ────────────────────────────────────────── */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h3 className="flex items-center gap-2 font-semibold text-[var(--app-pages-text)]">
                <Server className="h-4 w-4" /> SMTP Settings (Sending)
              </h3>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-pages-text)]">Host</label>
              <input
                type="text"
                name="smtpHost"
                required
                value={formData.smtpHost}
                onChange={handleChange}
                placeholder="smtp.example.com"
                className="w-full rounded-lg border border-[var(--app-pages-border)] bg-transparent p-2.5 text-[var(--app-pages-text)] outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--app-pages-text)]">Port</label>
              <input
                type="number"
                name="smtpPort"
                required
                value={formData.smtpPort}
                onChange={handleChange}
                placeholder="465"
                className="w-full rounded-lg border border-[var(--app-pages-border)] bg-transparent p-2.5 text-[var(--app-pages-text)] outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* ── Receiving Protocol Selector ───────────────────────────── */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-[var(--app-pages-text)]">Receiving Protocol</label>
            <div className="relative">
              <select
                name="receivingProtocol"
                value={formData.receivingProtocol}
                onChange={handleChange}
                className="w-full appearance-none rounded-lg border border-[var(--app-pages-border)] bg-transparent p-2.5 pr-10 text-[var(--app-pages-text)] outline-none focus:border-blue-500"
              >
                {RECEIVING_PROTOCOLS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} — {p.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {formData.receivingProtocol === 'none' && (
              <p className="mt-1 text-xs text-slate-500">
                Select this if you only need to send emails (campaigns). Receiving settings can be added later.
              </p>
            )}
          </div>

          {/* ── IMAP / POP3 Settings (conditional) ───────────────────── */}
          {showReceivingFields && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <h3 className="flex items-center gap-2 font-semibold text-[var(--app-pages-text)]">
                  <Server className="h-4 w-4" /> {protocolLabel} Settings (Receiving)
                </h3>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--app-pages-text)]">Host</label>
                <input
                  type="text"
                  name="imapHost"
                  required
                  value={formData.imapHost}
                  onChange={handleChange}
                  placeholder={PLACEHOLDER_HOSTS[formData.receivingProtocol] || 'imap.example.com'}
                  className="w-full rounded-lg border border-[var(--app-pages-border)] bg-transparent p-2.5 text-[var(--app-pages-text)] outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--app-pages-text)]">Port</label>
                <input
                  type="number"
                  name="imapPort"
                  required
                  value={formData.imapPort}
                  onChange={handleChange}
                  placeholder={DEFAULT_PORTS[formData.receivingProtocol] || '993'}
                  className="w-full rounded-lg border border-[var(--app-pages-border)] bg-transparent p-2.5 text-[var(--app-pages-text)] outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* ── Actions ──────────────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--app-pages-border)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
              {isLoading ? 'Connecting...' : 'Connect Account'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
