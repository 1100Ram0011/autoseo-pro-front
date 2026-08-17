"use client";

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Sparkles, TrendingUp, Users, Target, Bot, CheckCircle2, Mail, Eye, Quote } from 'lucide-react';
import { PageTransition, SectionTransition, AnimatedButton, fadeInUp, staggerContainer } from '@/components/animations';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email: 'test@example.com',
      password: 'password',
      redirect: false,
    });
    if (result?.ok) {
      router.push('/dashboard');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <PageTransition variant="fadeUp">
      <div className={styles.container}>
        {/* Left Panel - With Animations */}
        <motion.div 
          className={styles.leftPanel}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div 
            className={styles.logo}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Activity size={24} color="#5A4AF4" />
            </motion.div>
            AutoSEO Pro
          </motion.div>
          
          <motion.div 
            className={styles.badge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Sparkles size={16} /> AI Powered Platform
          </motion.div>

          <motion.div 
            className={styles.leftTitle}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
          >
            AI-Powered SEO<br/>Automation for<br/><span className={styles.highlight}>Modern Marketers</span>
          </motion.div>

          <motion.div 
            className={styles.leftSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Rank higher, get more traffic, and grow your business with the power of AI. Automate everything from keywords to content to leads.
          </motion.div>

          <motion.div 
            className={styles.featuresList}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {[
              { icon: TrendingUp, color: '#A855F7', title: 'Rank Higher', desc: 'AI-powered insights that boost rankings' },
              { icon: Users, color: '#3B82F6', title: 'Drive More Traffic', desc: 'Get discovered by the right audience' },
              { icon: Target, color: '#EF4444', title: 'Generate More Leads', desc: 'Convert visitors into paying customers' },
              { icon: Bot, color: '#8B5CF6', title: 'Automate Everything', desc: 'Save time with intelligent automation' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                className={styles.feature}
                variants={itemVariants}
                whileHover={{ x: 10 }}
              >
                <div className={styles.featureIcon}>
                  <feature.icon size={20} color={feature.color} />
                </div>
                <div className={styles.featureText}>
                  <span className={styles.featureTitle}>{feature.title}</span>
                  <span className={styles.featureDesc}>{feature.desc}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className={styles.trustedSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className={styles.trustedTitle}>
              <CheckCircle2 size={16} color="#10B981" /> Trusted by 5,000+ businesses worldwide
            </div>
          <div className={styles.logos}>
            <div className={styles.logoItem}><span style={{color: '#10B981'}}>envato</span></div>
            <div className={styles.logoItem}><Activity size={18}/> CLOUDWAYS</div>
            <div className={styles.logoItem}><span style={{color: '#EF4444', fontWeight: '800'}}>airbnb</span></div>
            <div className={styles.logoItem}><span style={{color: '#F97316'}}>HubSpot</span></div>
            <div className={styles.logoItem}>Microsoft</div>
          </div>

          <div className={styles.testimonial}>
            <div className={styles.quote}>
              <Quote size={20} color="#5A4AF4" style={{flexShrink: 0}} />
              AutoSEO Pro increased our organic traffic by 300% in just 3 months. The AI tools are game-changing!
            </div>
            <div className={styles.author}>
              <div className={styles.avatar}>AR</div>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>Aman Raj</span>
                <span className={styles.authorRole}>Marketing Head, TechCorp</span>
              </div>
            </div>
          </div>
          </motion.div>
        </motion.div>

        {/* Right Panel - Form with Animations */}
        <motion.div 
          className={styles.rightPanel}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.loginWrapper}>
            <motion.h1 
              className={styles.title}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome Back 👋
            </motion.h1>
            <motion.p 
              className={styles.subtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Sign in to your AutoSEO Pro account
            </motion.p>

            <motion.div 
              className={styles.loginBox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <motion.div 
                className={styles.ssoBtns}
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {[
                  { icon: 'G', text: 'Continue with Google', color: '#EA4335', onClick: () => signIn('google', { callbackUrl: '/dashboard' }) },
                  { icon: 'M', text: 'Continue with Microsoft', color: '#00A4EF', onClick: undefined }
                ].map((btn, i) => (
                  <motion.button 
                    key={i}
                    className={styles.ssoBtn}
                    onClick={btn.onClick}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span style={{fontSize:'1.2rem', color: btn.color, fontWeight:'bold'}}>{btn.icon}</span> {btn.text}
                  </motion.button>
                ))}
              </motion.div>

              <motion.div 
                className={styles.divider}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                or
              </motion.div>

              <motion.form 
                onSubmit={handleDevLogin}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  { label: 'Email Address', type: 'email', icon: Mail, placeholder: 'youremail@gmail.com', defaultValue: 'test@example.com' },
                  { label: 'Password', type: 'password', icon: Eye, placeholder: '••••••••••', defaultValue: 'password' }
                ].map((field, i) => (
                  <motion.div 
                    key={i}
                    className={styles.formGroup}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <label className={styles.label}>{field.label}</label>
                    <motion.div 
                      className={styles.inputWrapper}
                      whileFocus={{ scale: 1.02 }}
                    >
                      <input 
                        type={field.type}
                        className={styles.input} 
                        placeholder={field.placeholder} 
                        defaultValue={field.defaultValue}
                      />
                      <field.icon size={18} className={styles.inputIcon} />
                    </motion.div>
                  </motion.div>
                ))}

                <motion.div 
                  className={styles.optionsRow}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Remember Me
                  </label>
                  <a href="#" className={styles.forgotLink}>Forgot Password?</a>
                </motion.div>

                <motion.button 
                  type="submit" 
                  className={styles.submitBtn}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(167, 139, 250, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </motion.form>

              <motion.div 
                className={styles.signupText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                Don't have an account? <a href="#" className={styles.signupLink}>Sign up</a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
