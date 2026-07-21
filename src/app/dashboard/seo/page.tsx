"use client";

import { Calendar, ArrowUpRight, ArrowDownRight, Circle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './page.module.css';

const trafficData = [
  { name: 'May 10', organic: 100, previous: 80 },
  { name: 'May 11', organic: 120, previous: 90 },
  { name: 'May 12', organic: 150, previous: 100 },
  { name: 'May 13', organic: 180, previous: 110 },
  { name: 'May 14', organic: 220, previous: 130 },
  { name: 'May 15', organic: 260, previous: 150 },
  { name: 'May 16', organic: 300, previous: 160 },
];

export default function SeoDashboardPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>SEO Dashboard</div>
        <div className={styles.datePicker}>
          <Calendar size={16} /> May 10 - May 16, 2024
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>SEO Score</div>
          <div className={styles.metricValue}>87/100</div>
          <div className={styles.changePos}>Excellent</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Organic Traffic</div>
          <div className={styles.metricValue}>12.4K</div>
          <div className={styles.changePos}><ArrowUpRight size={14}/> +18.2%</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Keywords</div>
          <div className={styles.metricValue}>1.2K</div>
          <div className={styles.changePos}><ArrowUpRight size={14}/> +12.5%</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Backlinks</div>
          <div className={styles.metricValue}>4.2K</div>
          <div className={styles.changePos}><ArrowUpRight size={14}/> +8.1%</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>SEO Health Overview</div>
          <div className={styles.healthContent}>
            <div className={styles.healthRing}>87</div>
            <div className={styles.healthList}>
              <div className={styles.healthItem}>
                <div className={styles.healthItemLabel}><Circle size={10} fill="#10B981" color="#10B981"/> Technical SEO</div>
                <div className={styles.healthItemValue}>92%</div>
              </div>
              <div className={styles.healthItem}>
                <div className={styles.healthItemLabel}><Circle size={10} fill="#10B981" color="#10B981"/> Content SEO</div>
                <div className={styles.healthItemValue}>85%</div>
              </div>
              <div className={styles.healthItem}>
                <div className={styles.healthItemLabel}><Circle size={10} fill="#F59E0B" color="#F59E0B"/> Performance</div>
                <div className={styles.healthItemValue}>60%</div>
              </div>
              <div className={styles.healthItem}>
                <div className={styles.healthItemLabel}><Circle size={10} fill="#10B981" color="#10B981"/> Mobile SEO</div>
                <div className={styles.healthItemValue}>94%</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>Traffic Growth</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0F172A" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dx={-10} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}/>
                <Line type="monotone" dataKey="organic" stroke="#5A4AF4" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="previous" stroke="#64748B" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.tablesGrid}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Top Pages</div>
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th>Sessions</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>/</td><td>2.4K</td><td className={styles.changePos}>+8.2%</td></tr>
              <tr><td>/services</td><td>1.2K</td><td className={styles.changePos}>+7.1%</td></tr>
              <tr><td>/about</td><td>980</td><td className={styles.changePos}>+5.3%</td></tr>
            </tbody>
          </table>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Top Keywords</div>
          <table>
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Position</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>seo tools</td><td>1</td><td>2.4K</td></tr>
              <tr><td>seo audit</td><td>3</td><td>1.6K</td></tr>
              <tr><td>best seo tools</td><td>5</td><td>1.3K</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
