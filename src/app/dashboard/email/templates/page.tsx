"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Trash2, Edit } from 'lucide-react';
import { getEmailTemplates, deleteEmailTemplate } from '@/lib/emailApi';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getEmailTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error("Failed to load templates", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteEmailTemplate(id);
      fetchTemplates();
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete template");
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <FileText className="text-blue-500" />
            Email Templates
          </h1>
          <p className="text-muted-foreground">
            Manage your HTML email templates for marketing campaigns.
          </p>
        </div>
        <Button onClick={() => alert("Template Editor coming soon")} className="shrink-0 bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search templates..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center p-12 text-muted-foreground">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg bg-card text-muted-foreground">
          No templates found. Create your first template to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: any) => (
            <Card key={template._id || template.id} className="flex flex-col hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="truncate">{template.name}</CardTitle>
                <CardDescription className="truncate">Subject: {template.subject}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="bg-slate-100 dark:bg-slate-900 rounded border p-4 h-32 overflow-hidden relative">
                  <div className="text-xs text-muted-foreground opacity-50" dangerouslySetInnerHTML={{ __html: template.html.substring(0, 200) + '...' }} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100 dark:to-slate-900" />
                </div>
                {template.variables && template.variables.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.variables.map((v: string) => (
                      <span key={v} className="px-2 py-1 text-[10px] bg-blue-100 text-blue-800 rounded-full font-mono">
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-muted/20 border-t py-3">
                <div className="text-xs text-muted-foreground">
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => alert("Edit coming soon")} className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(template._id || template.id)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
