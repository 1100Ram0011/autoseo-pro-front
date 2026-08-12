"use client";

import React from 'react';
import ReduxProvider from '@/redux/ReduxProvider';
import MetaWhatsappCampaign from '@/components/whatappCampaignPages/metaWhatsapp/Page/MetaWhatsappCampaign';

export default function Page() {
  return (
    <ReduxProvider>
      <MetaWhatsappCampaign />
    </ReduxProvider>
  );
}
