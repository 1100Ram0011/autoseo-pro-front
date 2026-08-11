"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Target, Search, Plus, BarChart2, Mail, Users, FileSpreadsheet, RefreshCcw } from 'lucide-react';
import { getEmailCampaigns } from '@/lib/emailApi';
import Link from 'next/link';

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getEmailCampaigns(1, 50);
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("Failed to load campaigns", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sending':
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <Target className="text-blue-500" />
            Email Campaigns
          </h1>
          <p className="text-muted-foreground">
            Manage your broadcast email campaigns and view detailed analytics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => alert("Campaign Wizard coming soon")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <h3 className="text-sm font-medium">Total Campaigns</h3>
            </div>
            <div className="text-3xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <h3 className="text-sm font-medium">Total Recipients</h3>
            </div>
            <div className="text-3xl font-bold">
              {campaigns.reduce((acc, c) => acc + (c.totalRecipients || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
              <Mail className="h-4 w-4" />
              <h3 className="text-sm font-medium">Total Sent</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
              <BarChart2 className="h-4 w-4" />
              <h3 className="text-sm font-medium">Avg. Open Rate</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {campaigns.length > 0 
                ? Math.round(campaigns.reduce((acc, c) => acc + (c.openedCount || 0), 0) / Math.max(1, campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0)) * 100) 
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search campaigns..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Campaign Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Recipients</th>
                <th className="px-6 py-4 font-medium text-right">Sent</th>
                <th className="px-6 py-4 font-medium text-right">Opened</th>
                <th className="px-6 py-4 font-medium text-right">Clicked</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    Loading campaigns...
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground border-b border-dashed">
                    No campaigns found.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign: any) => (
                  <tr key={campaign._id || campaign.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex flex-col">
                        <span>{campaign.name}</span>
                        {campaign.templateId?.name && (
                          <span className="text-xs text-muted-foreground flex items-center mt-1">
                            <FileSpreadsheet className="w-3 h-3 mr-1" /> {campaign.templateId.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {campaign.totalRecipients?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600 font-medium">
                      {campaign.sentCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {campaign.openedCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {campaign.clickedCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => alert("Analytics coming soon")}>
                        View Report
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
