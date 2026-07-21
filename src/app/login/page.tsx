"use client";

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Activity, Sparkles, TrendingUp, Users, Target, Bot, CheckCircle2, Mail, Eye, Sun, Quote } from 'lucide-react';
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

  return (
    <div className={styles.container}>
      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <Activity size={24} color="#5A4AF4" />
          AutoSEO Pro
        </div>
        
        <div className={styles.badge}>
          <Sparkles size={16} /> AI Powered Platform
        </div>

        <div className={styles.leftTitle}>
          AI-Powered SEO<br/>Automation for<br/><span className={styles.highlight}>Modern Marketers</span>
        </div>

        <div className={styles.leftSubtitle}>
          Rank higher, get more traffic, and grow your business with the power of AI. Automate everything from keywords to content to leads.
        </div>

        <div className={styles.featuresList}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}><TrendingUp size={20} color="#A855F7" /></div>
            <div className={styles.featureText}>
              <span className={styles.featureTitle}>Rank Higher</span>
              <span className={styles.featureDesc}>AI-powered insights that boost rankings</span>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}><Users size={20} color="#3B82F6" /></div>
            <div className={styles.featureText}>
              <span className={styles.featureTitle}>Drive More Traffic</span>
              <span className={styles.featureDesc}>Get discovered by the right audience</span>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}><Target size={20} color="#EF4444" /></div>
            <div className={styles.featureText}>
              <span className={styles.featureTitle}>Generate More Leads</span>
              <span className={styles.featureDesc}>Convert visitors into paying customers</span>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}><Bot size={20} color="#8B5CF6" /></div>
            <div className={styles.featureText}>
              <span className={styles.featureTitle}>Automate Everything</span>
              <span className={styles.featureDesc}>Save time with intelligent automation</span>
            </div>
          </div>
        </div>

        <div className={styles.trustedSection}>
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
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.lightModeToggle}>
          <Sun size={16} /> Light Mode
        </div>

        <div className={styles.loginWrapper}>
          <h1 className={styles.title}>Welcome Back 👋</h1>
          <p className={styles.subtitle}>Sign in to your AutoSEO Pro account</p>

          <div className={styles.loginBox}>
            <div className={styles.ssoBtns}>
              <button className={styles.ssoBtn} onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
                <span style={{fontSize:'1.2rem', color:'#EA4335', fontWeight:'bold'}}>G</span> Continue with Google
              </button>
              <button className={styles.ssoBtn}>
                <span style={{fontSize:'1.2rem', color:'#00A4EF', fontWeight:'bold'}}>M</span> Continue with Microsoft
              </button>
            </div>

            <div className={styles.divider}>or</div>

            <form onSubmit={handleDevLogin}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <input type="email" className={styles.input} placeholder="youremail@gmail.com" defaultValue="test@example.com" />
                  <Mail size={18} className={styles.inputIcon} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <input type="password" className={styles.input} placeholder="••••••••••" defaultValue="password" />
                  <Eye size={18} className={styles.inputIcon} />
                </div>
              </div>

              <div className={styles.optionsRow}>
                <label className={styles.checkbox}>
                  <input type="checkbox" defaultChecked /> Remember Me
                </label>
                <a href="#" className={styles.forgotLink}>Forgot Password?</a>
              </div>

              <button type="submit" className={styles.submitBtn}>Sign In</button>
            </form>

            <div className={styles.signupText}>
              Don't have an account? <a href="#" className={styles.signupLink}>Sign up</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
