import React, { useState, useEffect } from 'react';
import { useGetCampaignLogsQuery } from '../../../../redux/apis/emailCampaignApi';
import { getSocket } from '@/services/socket.service';
import { X, CheckCircle2, AlertCircle, MinusCircle, User, Mail, Table, LayoutList, Eye, MousePointerClick } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CampaignLogsModal({ campaignId, onClose }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'excel'
  const { data: logsData, isLoading, isError, refetch } = useGetCampaignLogsQuery(campaignId, {
    skip: !campaignId,
  });

  const socket = getSocket();

  useEffect(() => {
    if (!socket || !campaignId) return;

    const onCampaignUpdated = (data) => {
      // data.campaignId comes from the socket event payload
      if (data && data.campaignId === campaignId) {
        refetch();
      }
    };

    socket.on('campaign:updated', onCampaignUpdated);
    return () => {
      socket.off('campaign:updated', onCampaignUpdated);
    };
  }, [socket, campaignId, refetch]);

  const logs = logsData?.logs || [];

  // Extract dynamic headers from dataFile if available
  const getDynamicHeaders = () => {
    if (!logs || logs.length === 0) return [];
    const headers = new Set();
    logs.forEach(log => {
      if (log.dataFile && typeof log.dataFile === 'object') {
        Object.keys(log.dataFile).forEach(key => headers.add(key));
      }
    });
    return Array.from(headers);
  };
  const dynamicHeaders = getDynamicHeaders();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 ">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden "
      >
        <div className="p-6 border-[var(--app-pages-border)] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-[var(--app-pages-text)] flex items-center gap-2">
              Campaign Recipients
            </h3>
            <p className="text-xs text-[var(--app-pages-subhead-text)] mt-1">
              View delivery status and logs for all recipients in this campaign.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {logs.length > 0 && (
              <button 
                onClick={() => setViewMode(prev => prev === 'list' ? 'excel' : 'list')}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] border border-[var(--app-pages-border)] rounded-lg text-sm font-medium transition"
              >
                {viewMode === 'list' ? (
                  <>
                    <Table size={16} />
                    Excel Preview
                  </>
                ) : (
                  <>
                    <LayoutList size={16} />
                    List View
                  </>
                )}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] rounded-full transition">
              <X size={20} className="text-[var(--app-pages-text)] hover:text-[var(--app-pages-muted)]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-0 bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] border border-[var(--app-pages-border)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--app-pages-text)]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--app-pages-border)] border-t-[var(--app-brand-primary)] mb-4" />
              <p className="text-sm">Loading logs...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--app-debit-color)]">
              <AlertCircle size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Failed to load campaign logs.</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--app-pages-subhead-text)]">
              <Mail size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No recipient logs found for this campaign.</p>
            </div>
          ) : viewMode === 'excel' ? (
            <div className="w-full overflow-auto border-t border-[var(--app-pages-border)]">
              <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                <thead className="bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] border border-[var(--app-pages-border)] sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="border border-[var(--app-pages-border)] px-3 py-2 font-semibold">Recipient Name</th>
                    <th className="border border-[var(--app-pages-border)] px-3 py-2 font-semibold">Recipient Email</th>
                    <th className="border border-[var(--app-pages-border)] px-3 py-2 font-semibold">Status</th>
                    <th className="border border-[var(--app-pages-border)] px-3 py-2 font-semibold">Details / Error</th>
                    <th className="border border-[var(--app-pages-border)] px-3 py-2 font-semibold">Date</th>
                    <th className="border border-[var(--app-pages-border)] px-3 py-2 font-semibold">Opened</th>
                    <th className="border border-[var(--app-pages-border)] px-3 py-2 font-semibold">Clicked</th>
                    {dynamicHeaders.map(header => (
                      <th key={header} className="border border-[var(--app-pages-border)] px-3 py-2 font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] border border-[var(--app-pages-border)]">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-[var(--app-pages-bg)] hover:text-[var(--app-pages-text)] border border-[var(--app-pages-border)]">
                      <td className="border border-[var(--app-pages-border)] px-3 py-1.5 text-[var(--app-pages-text)]">
                        {log.recipientName || 'Unknown'}
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-3 py-1.5 text-[var(--app-pages-text)]">
                        {log.recipientEmail}
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-3 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          log.status === 'sent' || log.status === 'delivered' ? 'border border-[var(--app-credit-color)] text-[var(--app-credit-color)]' :
                          log.status === 'failed' || log.status === 'bounced' || log.status === 'rejected' ? 'border border-[var(--app-debit-color)] text-[var(--app-debit-color)]' :
                          'border border-[var(--app-pages-border)] text-[var(--app-pages-text)]'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-3 py-1.5 text-[var(--app-pages-text)]">
                        {log.errorReason || ''}
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-3 py-1.5 text-[var(--app-pages-text)]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-3 py-1.5 text-[var(--app-pages-text)]">
                        {log.openedAt ? new Date(log.openedAt).toLocaleString() : '-'}
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-3 py-1.5 text-[var(--app-pages-text)]">
                        {log.clickedAt ? new Date(log.clickedAt).toLocaleString() : '-'}
                      </td>
                      {dynamicHeaders.map(header => (
                        <td key={header} className="border border-[var(--app-pages-border)] px-3 py-1.5 text-[var(--app-pages-text)]">
                          {log.dataFile && log.dataFile[header] !== undefined ? String(log.dataFile[header]) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="w-full text-sm text-left relative">
              <thead className="bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] sticky top-0 z-10 text-xs uppercase tracking-wide">
                <tr>
                  <th className="border border-[var(--app-pages-border)] px-6 py-3 font-semibold">Recipient</th>
                  <th className="border border-[var(--app-pages-border)] px-6 py-3 font-semibold">Sent From</th>
                  <th className="border border-[var(--app-pages-border)] px-6 py-3 font-semibold">Status</th>
                  <th className="border border-[var(--app-pages-border)] px-6 py-3 font-semibold">Read</th>
                  <th className="border border-[var(--app-pages-border)] px-6 py-3 font-semibold">Clicked</th>
                  <th className="border border-[var(--app-pages-border)] px-6 py-3 font-semibold">Details / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
                {logs.map((log) => {
                  let statusColor = "text-[var(--app-pages-text)] bg-[var(--app-pages-bg)]";
                  let Icon = MinusCircle;
                  if (log.status === 'sent' || log.status === 'delivered') {
                    statusColor = "text-[var(--app-credit-color)] bg-[var(--app-credit-color)]/10";
                    Icon = CheckCircle2;
                  } else if (log.status === 'failed' || log.status === 'bounced' || log.status === 'rejected') {
                    statusColor = "text-[var(--app-debit-color)] bg-[var(--app-debit-color)]/10";
                    Icon = AlertCircle;
                  } else if (log.status === 'skipped' || log.status === 'unsubscribed') {
                    statusColor = "text-[var(--app-pages-text)] bg-[var(--app-pages-bg)]";
                    Icon = MinusCircle;
                  }

                  return (
                    <tr key={log._id} className="hover:bg-[var(--app-pages-bg)] hover:text-[var(--app-pages-text)] ">
                      <td className="px-6 py-4 text-[var(--app-pages-text)]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] flex items-center justify-center shrink-0">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--app-pages-text)] ">
                              {log.recipientName || 'Unknown'}
                            </p>
                            <p className="text-xs text-[var(--app-pages-text)]  mt-0.5">
                              {log.recipientEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-6 py-4 text-[var(--app-pages-text)]">
                        {log.senderEmail ? (
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-[var(--app-pages-subhead-text)]" />
                            <span className="text-sm font-medium">{log.senderEmail}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--app-pages-subhead-text)] text-xs italic">Pending</span>
                        )}
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider ${statusColor}`}>
                          <Icon size={12} /> {log.status}
                        </span>
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-6 py-4">
                        {log.openedAt ? (
                          <div className="flex items-center gap-2">
                            {/* <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-fuchsia-200 text-fuchsia-600 bg-fuchsia-50 dark:border-fuchsia-500/30 dark:text-fuchsia-400 dark:bg-fuchsia-500/10 shrink-0">
                              <Eye size={10} /> Read
                            </span> */}
                            <span className="text-xs text-[var(--app-pages-text)] whitespace-nowrap">{new Date(log.openedAt).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--app-pages-subhead-text)] text-xs italic">-</span>
                        )}
                      </td>
                      <td className="border border-[var(--app-pages-border)] px-6 py-4">
                        {log.clickedAt ? (
                          <div className="flex items-center gap-2">
                            {/* <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-cyan-200 text-cyan-600 bg-cyan-50 dark:border-cyan-500/30 dark:text-cyan-400 dark:bg-cyan-500/10 shrink-0">
                              <MousePointerClick size={10} /> Clicked
                            </span> */}
                            <span className="text-xs text-[var(--app-pages-text)] whitespace-nowrap">{new Date(log.clickedAt).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--app-pages-subhead-text)] text-xs italic">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {log.errorReason ? (
                          <div className="text-xs text-[var(--app-pages-text)] whitespace-pre-wrap break-words min-w-[200px]" title={log.errorReason}>
                            {log.errorReason}
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--app-pages-text)] italic">No errors</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--app-pages-border)] flex justify-end shrink-0 bg-[var(--app-pages-bg)]">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] rounded-lg text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
