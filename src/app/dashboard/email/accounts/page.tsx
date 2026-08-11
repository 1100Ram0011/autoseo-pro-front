"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { getEmailAccounts, disconnectEmailAccount } from '@/lib/emailApi';

export default function EmailAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getEmailAccounts();
      setAccounts(data.tokens || []);
    } catch (error) {
      console.error("Failed to load accounts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      await disconnectEmailAccount(id);
      fetchAccounts();
    } catch (error) {
      console.error("Failed to disconnect", error);
      alert("Failed to disconnect account");
    }
  };

  const handleConnectGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/email-campaign/auth/google`;
  };

  const handleConnectMicrosoft = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/email-campaign/auth/microsoft`;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Mail className="text-blue-500" />
          Email Accounts
        </h1>
        <p className="text-muted-foreground">
          Connect your Google Workspace, Microsoft 365, or Custom SMTP accounts for sending campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connect Google */}
        <Card className="hover:border-blue-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </CardTitle>
            <CardDescription>Connect Gmail or Workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnectGoogle} className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Connect Google
            </Button>
          </CardContent>
        </Card>

        {/* Connect Microsoft */}
        <Card className="hover:border-blue-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M0 0h11v11H0z"/>
                <path fill="#81bc06" d="M12 0h11v11H12z"/>
                <path fill="#05a6f0" d="M0 12h11v11H0z"/>
                <path fill="#ffba08" d="M12 12h11v11H12z"/>
              </svg>
              Microsoft
            </CardTitle>
            <CardDescription>Connect Outlook or Microsoft 365</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnectMicrosoft} className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Connect Microsoft
            </Button>
          </CardContent>
        </Card>

        {/* Connect Custom SMTP */}
        <Card className="hover:border-blue-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Custom SMTP
            </CardTitle>
            <CardDescription>Connect any SMTP provider</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => alert('Custom SMTP form coming soon')} className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add SMTP
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
        {loading ? (
          <div className="text-center p-8 text-muted-foreground">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
            No email accounts connected yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {accounts.map((acc: any) => (
              <div key={acc._id || acc.id} className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    acc.provider === 'google' ? 'bg-red-100 text-red-600' :
                    acc.provider === 'microsoft' ? 'bg-blue-100 text-blue-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {acc.provider === 'google' && <Mail className="w-5 h-5" />}
                    {acc.provider === 'microsoft' && <Mail className="w-5 h-5" />}
                    {acc.provider === 'custom' && <Mail className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{acc.email}</h3>
                    <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
                      {acc.provider} 
                      {acc.status === 'active' ? (
                        <span className="text-green-500 flex items-center text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</span>
                      ) : (
                        <span className="text-red-500 flex items-center text-xs"><AlertCircle className="w-3 h-3 mr-1" /> {acc.status}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="font-medium text-foreground">Daily Limit: {acc.dailyLimit}</div>
                    <div className="text-muted-foreground">Sent: {acc.lifetimeSent}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDisconnect(acc._id || acc.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
