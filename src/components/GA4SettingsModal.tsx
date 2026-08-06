"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import styles from "./GA4SettingsModal.module.css";

interface GA4SettingsModalProps {
  siteId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (ga4PropertyId: string) => void;
}

export default function GA4SettingsModal({
  siteId,
  isOpen,
  onClose,
  onSaved,
}: GA4SettingsModalProps) {
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
      fetch(`${API_BASE}/auth/google/properties?email=${encodeURIComponent(email)}`).then(r => r.ok ? r.json() : null)
    ])
      .then(([settingsData, propsData]) => {
        if (settingsData) {
          const raw = settingsData.ga4PropertyId?.replace("properties/", "") ?? "";
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
      const selectedProp = properties.find(p => p.id.replace("properties/", "") === propertyId.trim());
      let siteUrlToUpdate = selectedProp?.name?.trim();
      
      // Only update URL if the property name looks like a domain (contains a dot and no spaces)
      if (siteUrlToUpdate && siteUrlToUpdate.includes('.') && !siteUrlToUpdate.includes(' ')) {
        if (!/^https?:\/\//i.test(siteUrlToUpdate)) {
          siteUrlToUpdate = 'https://' + siteUrlToUpdate;
        }
      } else {
        siteUrlToUpdate = undefined;
      }

      const res = await fetch(`${API_BASE}/sites/${siteId}/settings?email=${encodeURIComponent(email || '')}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ga4PropertyId: propertyId.trim(),
          ...(siteUrlToUpdate ? { url: siteUrlToUpdate } : {})
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      setSaved(true);
      onSaved?.(data.ga4PropertyId);
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
          <h2 className={styles.title}>Google Analytics 4 Settings</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className={styles.description}>
          Enter your GA4 Property ID to connect real analytics data. You can
          find this in GA4 under Admin → Property Settings.
        </p>

        {loading ? (
          <div className={styles.loadingRow}>
            <Loader2 className={styles.spinner} size={18} />
            <span>Loading current settings…</span>
          </div>
        ) : (
          <>
            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label htmlFor="ga4-property-id" className={styles.label} style={{ marginBottom: 0 }}>
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
                      const res = await fetch(`${API_BASE}/sites/${siteId}/auto-detect-ga4`, { method: 'POST' });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        const rawId = data.propertyId.replace("properties/", "");
                        setPropertyId(rawId);
                        setSaved(true);
                        onSaved?.(rawId);
                        setTimeout(() => setSaved(false), 2000);
                      } else {
                        setError(data.error || 'Failed to auto-detect GA4 property.');
                      }
                    } catch (e) {
                      setError('Failed to auto-detect GA4 property.');
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
                  id="ga4-property-id"
                  className={styles.input}
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                >
                  <option value="">-- Select a property --</option>
                  {properties.map((p) => {
                    const rawId = p.id.replace("properties/", "");
                    return (
                      <option key={rawId} value={rawId}>
                        {p.name} ({rawId})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  id="ga4-property-id"
                  className={styles.input}
                  type="text"
                  placeholder="e.g. 123456789"
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
                {saving ? "Saving…" : saved ? "Saved" : "Save Property ID"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
