"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Database, FileText, Rocket, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { 
  getWhatsappTemplates, 
  getCampaignConnections, 
  getWhatsappDatasets, 
  estimateWhatsappCampaign, 
  createWhatsappCampaign 
} from "@/lib/whatsappApi";

export default function CreateCampaignDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [variableMappings, setVariableMappings] = useState<Record<string, any>>({});
  const [estimate, setEstimate] = useState<any>(null);
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, dData, cData] = await Promise.all([
        getWhatsappTemplates(),
        getWhatsappDatasets(),
        getCampaignConnections()
      ]);
      setTemplates(tData?.data || []);
      setDatasets(dData?.data || []);
      setConnections(cData?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 3 && selectedTemplate && selectedDataset && selectedConnections.length) {
      runEstimate();
    }
  }, [currentStep]);

  const runEstimate = async () => {
    try {
      const mappedVariables = Object.fromEntries(
        Object.entries(variableMappings).map(([variable, mapping]) => [variable, mapping?.value || ""])
      );
      
      const res = await estimateWhatsappCampaign({
        campaignName,
        templateId: selectedTemplate.templateId,
        datasetId: selectedDataset.datasetId,
        selectedConnections,
        variableMappings: mappedVariables
      });
      setEstimate(res.data || res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to estimate campaign");
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!campaignName.trim()) return toast.error("Campaign name is required");
      if (!selectedTemplate) return toast.error("Select a template");
      if (!selectedConnections.length) return toast.error("Select at least one connection");
    }
    if (currentStep === 2) {
      if (!selectedDataset) return toast.error("Select a dataset");
      // Basic validation for variables
      const vars = selectedTemplate?.variables || [];
      for (const v of vars) {
        if (!variableMappings[v]?.value) {
          return toast.error(`Mapping for ${v} is required`);
        }
      }
    }
    setCurrentStep(s => s + 1);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const mappedVariables = Object.fromEntries(
        Object.entries(variableMappings).map(([variable, mapping]) => [variable, mapping?.value || ""])
      );
      
      await createWhatsappCampaign({
        campaignName,
        templateId: selectedTemplate.templateId,
        datasetId: selectedDataset.datasetId,
        selectedConnections,
        variableMappings: mappedVariables,
        isShuffled: false,
      });
      toast.success("Campaign created successfully!");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish campaign");
    } finally {
      setPublishing(false);
    }
  };

  const toggleConnection = (id: string) => {
    setSelectedConnections(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Create WhatsApp Campaign</DialogTitle>
          <DialogDescription>Setup your templates, recipients and launch.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Steps */}
          <div className="w-64 border-r bg-slate-50/50 dark:bg-slate-900 p-6 hidden md:block">
            <div className="space-y-6">
              {[
                { step: 1, label: "Setup", icon: FileText },
                { step: 2, label: "Dataset", icon: Database },
                { step: 3, label: "Publish", icon: Rocket }
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isPassed = currentStep > s.step;
                return (
                  <div key={s.step} className={`flex items-center gap-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : isPassed ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : isPassed ? 'border-green-600 bg-green-50' : 'border-slate-300'}`}>
                      {isPassed ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                    </div>
                    <span className="font-medium">{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
            <ScrollArea className="flex-1 p-6">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <>
                  {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Campaign Details</h3>
                        <Input 
                          placeholder="Campaign Name (e.g. Summer Promo 2026)" 
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Select Template</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {templates.map(tpl => (
                            <Card 
                              key={tpl.templateId} 
                              className={`cursor-pointer transition-all ${selectedTemplate?.templateId === tpl.templateId ? 'ring-2 ring-blue-600' : 'hover:border-blue-300'}`}
                              onClick={() => setSelectedTemplate(tpl)}
                            >
                              <CardContent className="p-4">
                                <h4 className="font-semibold">{tpl.name}</h4>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{tpl.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Sender Accounts</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {connections.map(conn => (
                            <Card 
                              key={conn.connectionId}
                              className={`cursor-pointer transition-all ${selectedConnections.includes(conn.connectionId) ? 'ring-2 ring-blue-600' : 'hover:border-blue-300'}`}
                              onClick={() => toggleConnection(conn.connectionId)}
                            >
                              <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-4 w-4 rounded border flex items-center justify-center">
                                  {selectedConnections.includes(conn.connectionId) && <Check className="h-3 w-3" />}
                                </div>
                                <div>
                                  <p className="font-medium">{conn.displayName}</p>
                                  <p className="text-sm text-slate-500">+{conn.linkedNumber}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Select Dataset</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {datasets.map(ds => (
                            <Card 
                              key={ds.datasetId}
                              className={`cursor-pointer transition-all ${selectedDataset?.datasetId === ds.datasetId ? 'ring-2 ring-blue-600' : 'hover:border-blue-300'}`}
                              onClick={() => setSelectedDataset(ds)}
                            >
                              <CardContent className="p-4">
                                <h4 className="font-semibold">{ds.name}</h4>
                                <p className="text-sm text-slate-500 mt-1">{ds.validRows} valid rows</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {selectedTemplate?.variables?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Variable Mapping</h3>
                          <div className="space-y-4 max-w-lg">
                            {selectedTemplate.variables.map((variable: string) => (
                              <div key={variable} className="flex items-center gap-4">
                                <div className="w-1/3 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded">
                                  {'{'}{'{'}{variable}{'}'}{'}'}
                                </div>
                                <div className="flex-1">
                                  <Input 
                                    placeholder="Enter static value or column name"
                                    value={variableMappings[variable]?.value || ""}
                                    onChange={(e) => setVariableMappings({
                                      ...variableMappings,
                                      [variable]: { type: "static", value: e.target.value }
                                    })}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-2">Ready to Launch!</h3>
                        <p>Your campaign "{campaignName}" is configured and ready to be queued.</p>
                      </div>

                      {estimate && (
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-sm text-slate-500">Total Recipients</p>
                              <p className="text-2xl font-bold">{estimate.totalRecipients || selectedDataset?.validRows}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-sm text-slate-500">Estimated Cost</p>
                              <p className="text-2xl font-bold">₹{estimate.estimatedCost || '0.00'}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-sm text-slate-500">Processing Time</p>
                              <p className="text-2xl font-bold">~{estimate.estimatedTime || '2 min'}</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>

            <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : onOpenChange(false)}
              >
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={loading}>Next Step</Button>
              ) : (
                <Button onClick={handlePublish} disabled={publishing || loading} className="bg-green-600 hover:bg-green-700 text-white">
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                  Publish Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
