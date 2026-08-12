"use client";

import React from 'react';
import ReduxProvider from '@/redux/ReduxProvider';
import EmailCampaignPage from '@/components/features/emailCampaign/EmailCampaignPage';

export default function Page() {
  return (
    <ReduxProvider>
      <EmailCampaignPage />
    </ReduxProvider>
  );
}
