"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Info, Settings, User, Bell, Shield, Key, Save, Mail, Globe, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TextField, Button, Switch, MenuItem, Select, FormControl, InputLabel, Paper, Typography } from '@mui/material';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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
      className="p-6 md:p-10 max-w-[1200px] mx-auto text-slate-800 dark:text-slate-100 font-sans"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 m-0">
            <Settings size={32} className="text-purple-500" /> Account Settings
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal profile, notification preferences, and security settings.
          </p>
          
          {/* Info Block */}
          <Paper elevation={0} className="mt-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 p-4 rounded-xl flex gap-3 shadow-sm">
            <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <Typography variant="subtitle2" className="text-blue-700 dark:text-blue-400 font-bold mb-1">How does this work?</Typography>
              <Typography variant="body2" className="text-blue-800 dark:text-blue-300">
                Configure your AutoSEO Pro account preferences and team settings. <strong>Example:</strong> Change your timezone, update your profile, or invite team members to collaborate.
              </Typography>
            </div>
          </Paper>
        </div>
        
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <Settings size={18} className="animate-spin" /> : <Save size={18} />}
          sx={{ 
            borderRadius: '12px', 
            padding: '10px 24px', 
            textTransform: 'none', 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 4px 14px 0 rgba(139,92,246,0.39)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            }
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
        
        {/* SIDEBAR NAVIGATION */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          {[
            { id: 'profile', icon: <User size={18} />, label: 'Profile Information' },
            { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
            { id: 'preferences', icon: <Palette size={18} />, label: 'Preferences' },
            { id: 'security', icon: <Shield size={18} />, label: 'Security & Password' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-l-4 border-purple-500 shadow-sm' 
                  : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>

        {/* TAB CONTENT */}
        <motion.div variants={itemVariants}>
          <Paper elevation={0} className="glass-card p-8 animate-dash h-full">
            <AnimatePresence mode="wait">
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-6">
                    <User size={22} className="text-blue-500" /> Profile Information
                  </div>
                  
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <Button variant="outlined" size="small" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, mb: 1, borderColor: 'rgba(148, 163, 184, 0.3)', color: 'inherit' }}>
                        Upload New Avatar
                      </Button>
                      <Typography variant="caption" component="div" className="text-slate-500 dark:text-slate-400">
                        JPG, GIF or PNG. Max size of 2MB.
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextField 
                      label="Full Name" 
                      variant="outlined" 
                      fullWidth 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField 
                      label="Company Name" 
                      variant="outlined" 
                      fullWidth 
                      value={company} 
                      onChange={e => setCompany(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField 
                      label="Email Address" 
                      type="email"
                      variant="outlined" 
                      fullWidth 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      sx={{ gridColumn: '1 / -1', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </div>
                </motion.div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-6">
                    <Bell size={22} className="text-amber-500" /> Notification Preferences
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    {[
                      { label: 'Email Notifications', desc: 'Receive alerts and reports via email.', state: notifyEmail, setter: setNotifyEmail },
                      { label: 'Traffic Drop Alerts', desc: 'Get notified immediately if traffic drops by more than 20%.', state: notifyTrafficDrop, setter: setNotifyTrafficDrop },
                      { label: 'New Backlinks Discovered', desc: 'Alert me when a high DA backlink is acquired.', state: notifyNewLinks, setter: setNotifyNewLinks },
                      { label: 'Weekly SEO Report', desc: 'A summary of ranking changes and performance sent every Monday.', state: notifyWeeklyReport, setter: setNotifyWeeklyReport }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                        <div>
                          <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-white mb-1">{item.label}</Typography>
                          <Typography variant="body2" className="text-slate-500 dark:text-slate-400">{item.desc}</Typography>
                        </div>
                        <Switch 
                          checked={item.state} 
                          onChange={e => item.setter(e.target.checked)} 
                          color="primary"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* PREFERENCES TAB */}
              {activeTab === 'preferences' && (
                <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-6">
                    <Palette size={22} className="text-purple-500" /> App Preferences
                  </div>
                  
                  <div className="flex flex-col gap-8">
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Theme</InputLabel>
                      <Select
                        value={theme}
                        onChange={e => setTheme(e.target.value)}
                        label="Theme"
                        sx={{ borderRadius: '12px' }}
                      >
                        <MenuItem value="dark">Dark Theme (Glassmorphism)</MenuItem>
                        <MenuItem value="light">Light Theme</MenuItem>
                        <MenuItem value="system">System Default</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        label="Language"
                        sx={{ borderRadius: '12px' }}
                        startAdornment={<Globe size={18} className="mr-2 text-slate-400" />}
                      >
                        <MenuItem value="en">English (US)</MenuItem>
                        <MenuItem value="es">Español</MenuItem>
                        <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                        label="Timezone"
                        sx={{ borderRadius: '12px' }}
                      >
                        <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                        <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                        <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                        <MenuItem value="UTC">UTC</MenuItem>
                      </Select>
                      <Typography variant="caption" className="text-slate-500 dark:text-slate-400 mt-2 ml-1">
                        All charts and reports will be displayed in this timezone.
                      </Typography>
                    </FormControl>
                  </div>
                </motion.div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="flex items-center gap-2 text-lg font-bold text-red-500 border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-6">
                    <Shield size={22} /> Security & Password
                  </div>
                  
                  <div className="flex flex-col gap-6 pb-8 border-b border-slate-200 dark:border-slate-700/50 mb-8">
                    <TextField 
                      label="Current Password" 
                      type="password"
                      variant="outlined" 
                      fullWidth 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField 
                      label="New Password" 
                      type="password"
                      variant="outlined" 
                      fullWidth 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField 
                      label="Confirm New Password" 
                      type="password"
                      variant="outlined" 
                      fullWidth 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <div>
                      <Button variant="outlined" color="primary" sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-white mb-2">Two-Factor Authentication</Typography>
                    <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                      Add an extra layer of security to your account. Once enabled, you'll be required to enter both your password and an authentication code from your mobile app.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="success" 
                      startIcon={<Key size={16} />}
                      sx={{ 
                        borderRadius: '10px', 
                        textTransform: 'none', 
                        fontWeight: 600,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          boxShadow: 'none',
                        }
                      }}
                    >
                      Enable 2FA
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>
      </div>
    </motion.div>
  );
}
