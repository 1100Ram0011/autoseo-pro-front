"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import styles from "./GA4SettingsModal.module.css";

interface GSCSettingsModalProps {
  siteId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (gscPropertyId: string) => void;
}

export default function GSCSettingsModal({
  siteId,
  isOpen,
  onClose,
  onSaved,
}: GSCSettingsModalProps) {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const [propertyId, setPropertyId] = useState("");
  const [properties, setProperties] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !email) return;

    setError(null);
    setSaved(false);
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE}/sites/${siteId}/settings?email=${encodeURIComponent(email || '')}`).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/auth/google/gsc-properties?email=${encodeURIComponent(email)}`).then(r => r.ok ? r.json() : null)
    ])
      .then(([settingsData, propsData]) => {
        if (settingsData) {
          const raw = settingsData.gscPropertyId ?? "";
          setPropertyId(raw);
        }
        if (propsData && propsData.properties) {
          setProperties(propsData.properties);
        }
      })
      .catch(() => setError("Couldn't load current settings."))
      .finally(() => setLoading(false));
  }, [isOpen, siteId, email]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/sites/${siteId}/settings?email=${encodeURIComponent(email || '')}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gscPropertyId: propertyId.trim() }),
      });

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      setSaved(true);
      onSaved?.(data.gscPropertyId);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Couldn't save. Double check the Property ID and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Google Search Console Settings</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className={styles.description}>
          Select your Google Search Console Property to connect organic search data.
        </p>

        {loading ? (
          <div className={styles.loadingRow}>
            <Loader2 className={styles.spinner} size={18} />
            <span>Loading properties from Google…</span>
          </div>
        ) : (
          <>
            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label htmlFor="gsc-property-id" className={styles.label} style={{ marginBottom: 0 }}>
                  Select Property
                </label>
                <button
                  type="button"
                  className={styles.saveButton}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const res = await fetch(`${API_BASE}/sites/${siteId}/auto-detect-gsc`, { method: 'POST' });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setPropertyId(data.propertyId);
                        setSaved(true);
                        onSaved?.(data.propertyId);
                        setTimeout(() => setSaved(false), 2000);
                      } else {
                        setError(data.error || 'Failed to auto-detect property.');
                      }
                    } catch (e) {
                      setError('Failed to auto-detect property.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Auto-Detect
                </button>
              </div>
              
              {properties.length > 0 ? (
                <select
                  id="gsc-property-id"
                  className={styles.input}
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                >
                  <option value="">-- Select a property --</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="gsc-property-id"
                  className={styles.input}
                  type="text"
                  placeholder="e.g. sc-domain:example.com or https://example.com/"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                />
              )}
              {properties.length === 0 && (
                 <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Make sure you are connected to Google to auto-fetch properties.</p>
              )}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={saving || !propertyId.trim()}
              >
                {saving ? (
                  <Loader2 className={styles.spinner} size={16} />
                ) : saved ? (
                  <CheckCircle2 size={16} />
                ) : null}
                {saving ? "Saving…" : saved ? "Saved" : "Save Property"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
