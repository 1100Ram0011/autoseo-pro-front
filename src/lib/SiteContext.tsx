"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getSites } from './api';

const STORAGE_KEY = 'autoseo-active-site-id';

interface Site {
  id: string;
  url: string;
  planId?: string;
}

interface SiteContextValue {
  sites: Site[];
  activeSite: Site | null;
  selectedSiteId: string | null;
  setSelectedSite: (site: Site) => void;
  isLoading: boolean;
}

const SiteContext = createContext<SiteContextValue>({
  sites: [],
  activeSite: null,
  selectedSiteId: null,
  setSelectedSite: () => {},
  isLoading: true,
});

export function SiteProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSites() {
      if (!session?.user?.email) return;
      try {
        setIsLoading(true);
        const data = await getSites(session.user.email);
        if (data && data.length > 0) {
          setSites(data);

          // Restore previously saved site
          const savedId = localStorage.getItem(STORAGE_KEY);
          const found = data.find((s: Site) => s.id === savedId);
          if (found) {
            setActiveSite(found);
          } else {
            setActiveSite(data[0]);
            localStorage.setItem(STORAGE_KEY, data[0].id);
          }
        }
      } catch (err) {
        console.error('[SiteContext] Failed to fetch sites', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSites();
  }, [session?.user?.email]);

  const setSelectedSite = useCallback((site: Site) => {
    setActiveSite(site);
    localStorage.setItem(STORAGE_KEY, site.id);
    // Reload so all page data refreshes for the new site
    window.location.reload();
  }, []);

  return (
    <SiteContext.Provider
      value={{
        sites,
        activeSite,
        selectedSiteId: activeSite?.id ?? null,
        setSelectedSite,
        isLoading,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

/** Use this hook in any page to get the globally selected site */
export function useSite() {
  return useContext(SiteContext);
}
