"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';
import NextLink from 'next/link';

export const useNavigate = () => {
    const router = useRouter();
    return (path) => {
        try {
            router.push(path);
        } catch (e) {
            console.error(e);
        }
    };
};

export const useLocation = () => {
    const pathname = usePathname();
    return { pathname, search: '', hash: '', state: null };
};

export const useSearchParams = () => {
    const params = useNextSearchParams();
    return [params, () => {}];
};

export const useOutletContext = () => {
    return {};
};

export const Outlet = ({ children }) => <>{children}</>;

export const Link = ({ to, children, className, ...props }) => {
    return <NextLink href={to || '#'} className={className} {...props}>{children}</NextLink>;
};
