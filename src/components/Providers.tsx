"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { SiteProvider } from "@/lib/SiteContext";
import { useEffect } from "react";
import { API_BASE } from "@/lib/apiConfig";

function FetchInterceptor({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      sessionStorage.setItem('autoseo-user-email', session.user.email);
    } else {
      sessionStorage.removeItem('autoseo-user-email');
    }
  }, [session]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      let url = '';
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input instanceof Request) {
        url = input.url;
      }

      if (url.includes(API_BASE)) {
        const email = sessionStorage.getItem('autoseo-user-email');
        if (email) {
          if (input instanceof Request) {
            input.headers.set('x-user-email', email);
          } else {
            init = init || {};
            const headers = new Headers(init.headers || {});
            headers.set('x-user-email', email);
            init.headers = headers;
          }
        }
      }

      return originalFetch.apply(this, [input, init]);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SiteProvider>
        <FetchInterceptor>
          {children}
        </FetchInterceptor>
      </SiteProvider>
    </SessionProvider>
  );
}
