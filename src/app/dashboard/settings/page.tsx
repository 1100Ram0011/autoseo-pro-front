"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Info, Settings, User, Bell, Shield, Key, Save, CheckCircle, 
  Mail, Globe, Palette} from 'lucide-react';
import { toast } from 'react-hot-toast';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'security'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile State
  const [name, setName] = useState('Mytek AI User');
  const [email, setEmail] = useState('user@mytek.ai');
  const [company, setCompany] = useState('Mytek AI');

  // Notifications State
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyTrafficDrop, setNotifyTrafficDrop] = useState(true);
  const [notifyNewLinks, setNotifyNewLinks] = useState(false);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(true);

  // Preferences State
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Settings saved successfully!');
    }, 800);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#0F172A', fontFamily: "'Inter', sans-serif" }}
    >
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings size={28} color="#8b5cf6" /> Account Settings
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748B' }}>
            Manage your personal profile, notification preferences, and security settings.
          </p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Configure your AutoSEO Pro account preferences and team settings. <strong>Example:</strong> Change your timezone, update your profile, or invite team members to collaborate.
          </p>
        </div>
      </div>
  
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
            color: '#0F172A', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: 600,
            opacity: loading ? 0.8 : 1,
            transition: 'all 0.2s',
            boxShadow: '0 4px 14px 0 rgba(59,130,246,0.39)'
          }}
        >
          {loading ? <div className="spinner"><Settings size={18} /></div> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem' }}>
        
        {/* SIDEBAR NAVIGATION */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'profile', icon: <User size={18} />, label: 'Profile Information' },
            { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
            { id: 'preferences', icon: <Palette size={18} />, label: 'Preferences' },
            { id: 'security', icon: <Shield size={18} />, label: 'Security & Password' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', 
                background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === tab.id ? '#8b5cf6' : '#64748B',
                border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                fontWeight: activeTab === tab.id ? 600 : 500,
                transition: 'all 0.2s',
                borderLeft: activeTab === tab.id ? '3px solid #8b5cf6' : '3px solid transparent'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>

        {/* TAB CONTENT */}
        <motion.div variants={itemVariants} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '2rem', height: 'fit-content' }}>
          
          <AnimatePresence mode="wait">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #FFFFFF', paddingBottom: '1rem' }}>
                  <User size={20} color="#3b82f6" /> Profile Information
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#0F172A' }}>
                    {name.charAt(0)}
                  </div>
                  <div>
                    <button style={{ padding: '0.5rem 1rem', background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem', transition: 'all 0.2s' }}>
                      Upload New Avatar
                    </button>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>JPG, GIF or PNG. Max size of 2MB.</div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Company Name</label>
                    <input type="text" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
                        <Mail size={16} />
                      </div>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 36px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #FFFFFF', paddingBottom: '1rem' }}>
                  <Bell size={20} color="#f59e0b" /> Notification Preferences
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { label: 'Email Notifications', desc: 'Receive alerts and reports via email.', state: notifyEmail, setter: setNotifyEmail },
                    { label: 'Traffic Drop Alerts', desc: 'Get notified immediately if traffic drops by more than 20%.', state: notifyTrafficDrop, setter: setNotifyTrafficDrop },
                    { label: 'New Backlinks Discovered', desc: 'Alert me when a high DA backlink is acquired.', state: notifyNewLinks, setter: setNotifyNewLinks },
                    { label: 'Weekly SEO Report', desc: 'A summary of ranking changes and performance sent every Monday.', state: notifyWeeklyReport, setter: setNotifyWeeklyReport }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #FFFFFF' }}>
                      <div>
                        <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.label}</div>
                        <div style={{ color: '#64748B', fontSize: '0.85rem' }}>{item.desc}</div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={item.state} onChange={e => item.setter(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: item.state ? '#3b82f6' : '#E2E8F0', transition: '.4s', borderRadius: '34px' }}>
                          <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: item.state ? '24px' : '4px', bottom: '4px', backgroundColor: '#0F172A', transition: '.4s', borderRadius: '50%' }} />
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #FFFFFF', paddingBottom: '1rem' }}>
                  <Palette size={20} color="#8b5cf6" /> App Preferences
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Theme</label>
                    <select value={theme} onChange={e => setTheme(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                      <option value="dark">Dark Theme (Glassmorphism)</option>
                      <option value="light">Light Theme</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Language</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
                        <Globe size={16} />
                      </div>
                      <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 36px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Timezone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>All charts and reports will be displayed in this timezone.</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #FFFFFF', paddingBottom: '1rem' }}>
                  <Shield size={20} /> Security & Password
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', paddingBottom: '2rem', borderBottom: '1px solid #FFFFFF', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Current Password</label>
                    <input type="password" placeholder="••••••••" style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>New Password</label>
                    <input type="password" placeholder="Create a strong password" style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Confirm New Password</label>
                    <input type="password" style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />
                  </div>
                  <div>
                    <button style={{ padding: '0.75rem 1.5rem', background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      Update Password
                    </button>
                  </div>
                </div>

                <div>
                  <h3 style={{ color: '#0F172A', fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>Two-Factor Authentication</h3>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    Add an extra layer of security to your account. Once enabled, you'll be required to enter both your password and an authentication code from your mobile app.
                  </p>
                  <button style={{ padding: '0.75rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    <Key size={16} /> Enable 2FA
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}} />
    </motion.div>
  );
}
