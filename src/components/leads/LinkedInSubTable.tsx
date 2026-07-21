import React, { useState } from 'react';
import { useLinkedinLead } from '@/hooks/useLeads';
import { Loader2, Users, Sparkles, RefreshCcw } from 'lucide-react';
import styles from './leads.module.css';

interface LinkedInSubTableProps {
  lead: any;
}

export default function LinkedInSubTable({ lead }: LinkedInSubTableProps) {
    const { linkedinLead, isLoading, generateLinkedinLead, enrichEmployee } = useLinkedinLead(lead.id);
    const [enrichingEmpName, setEnrichingEmpName] = useState<string | null>(null);

    const handleEnrich = async (empName: string, profileUrl: string, compName: string) => {
        setEnrichingEmpName(empName);
        await enrichEmployee(empName, profileUrl, compName);
        setEnrichingEmpName(null);
    };

    if (isLoading) {
        return (
            <div className={styles.subTableContainer} style={{ textAlign: 'center', padding: '32px' }}>
                <Loader2 size={24} className="animate-spin text-blue-500" style={{ margin: '0 auto 8px auto' }} />
                <p>Loading LinkedIn data...</p>
            </div>
        );
    }

    if (!linkedinLead) {
        return (
            <div className={styles.subTableContainer} style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ marginBottom: '16px' }}>No LinkedIn data extracted for this company yet.</p>
                <button 
                    className={styles.generateBtn} 
                    style={{ margin: '0 auto' }}
                    onClick={() => generateLinkedinLead(lead.name)}
                >
                    <Sparkles size={16} /> Fetch Employees via Apify
                </button>
            </div>
        );
    }

    return (
        <div className={styles.subTableContainer}>
            <div className={styles.statsBar}>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>MATCH SCORE</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                            <div style={{ width: '89%', height: '100%', background: '#f59e0b', borderRadius: '2px' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>89%</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>REVIEWS</span>
                    <span className={styles.statValue}>{lead.reviews} reviews</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>WEBSITE</span>
                    <span className={styles.statValue}>
                        <a href={linkedinLead.website || lead.website} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>
                            {linkedinLead.website || lead.website}
                        </a>
                    </span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>ADDED</span>
                    <span className={styles.statValue}>{new Date(linkedinLead.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>ALL PHONES</span>
                    <span className={styles.statValue} style={{ color: '#10b981' }}>📞 {lead.phone}</span>
                </div>
            </div>

            {/* Top Level Company Info Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '16px' }}>
                <table className={styles.innerTable}>
                    <thead>
                        <tr>
                            <th>COMPANY</th>
                            <th>INDUSTRY</th>
                            <th>HEADQUARTERS</th>
                            <th>COMPANY SIZE</th>
                            <th>EMPLOYEES (SCRAPED)</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {linkedinLead.logoUrl ? (
                                        <img src={linkedinLead.logoUrl} alt={linkedinLead.companyName} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {linkedinLead.companyName?.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <a href={linkedinLead.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {linkedinLead.companyName}
                                        </a>
                                    </div>
                                </div>
                            </td>
                            <td>{linkedinLead.industry || '-'}</td>
                            <td>{linkedinLead.headquarters || '-'}</td>
                            <td>
                                <div>{linkedinLead.companySize || '-'}</div>
                                {linkedinLead.followers ? <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{linkedinLead.followers.toLocaleString()} followers</div> : null}
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={14} className="text-gray-400" />
                                    {linkedinLead.employees?.length || 0} extracted
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>({linkedinLead.employeeCount || 0} total)</span>
                                </div>
                            </td>
                            <td>
                                <span className={
                                    linkedinLead.status === 'completed' ? styles.statusBadgeSuccess :
                                    linkedinLead.status === 'failed' ? styles.statusBadgeError : styles.statusBadgePending
                                }>
                                    {linkedinLead.status === 'completed' ? (
                                        <><Sparkles size={12} /> AI Extraction Complete</>
                                    ) : linkedinLead.status === 'failed' ? (
                                        'Extraction Failed'
                                    ) : (
                                        <><Loader2 size={12} className="animate-spin" /> {linkedinLead.status.replace('_', ' ')}...</>
                                    )}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Employees Table */}
            {linkedinLead.employees && linkedinLead.employees.length > 0 ? (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <table className={styles.innerTable}>
                        <thead>
                            <tr>
                                <th>Personal Name</th>
                                <th>Designation</th>
                                <th>Location</th>
                                <th>Personal Mobile</th>
                                <th>Office Mobile</th>
                                <th>Personal Email</th>
                                <th>Office Email</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {linkedinLead.employees.map((emp: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500, color: '#3b82f6' }}>
                                        <a href={emp.profileUrl} target="_blank" rel="noreferrer">{emp.name || '-'}</a>
                                    </td>
                                    <td title={emp.title} style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.title || '-'}</td>
                                    <td>{emp.city || '-'}, {emp.country || '-'}</td>
                                    <td>{emp.mobilePhone || '-'}</td>
                                    <td>{emp.phone || '-'}</td>
                                    <td>{emp.personalEmail || '-'}</td>
                                    <td>{emp.email || '-'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleEnrich(emp.name, emp.profileUrl, linkedinLead.companyName)}
                                            disabled={enrichingEmpName === emp.name}
                                            className={styles.enrichBtn}
                                        >
                                            {enrichingEmpName === emp.name ? (
                                                <><Loader2 size={12} className="animate-spin" /> ...</>
                                            ) : (
                                                'Get Contact'
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    No employees found for this company yet. Wait for extraction to complete.
                </div>
            )}
        </div>
    );
}
