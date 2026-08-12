"use client";

import React from 'react';
import ReduxProvider from '@/redux/ReduxProvider';
import EmailTemplatesPage from '@/components/features/emailTemplate/EmailTemplatesPage';

export default function Page() {
  return (
    <ReduxProvider>
      <EmailTemplatesPage />
    </ReduxProvider>
  );
}
