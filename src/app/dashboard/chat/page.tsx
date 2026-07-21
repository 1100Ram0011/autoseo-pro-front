"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Sparkles, MessageSquarePlus } from 'lucide-react';
import styles from './page.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI SEO Copilot. I have access to your GA4, Search Console, and Lighthouse data. How can I help you grow your traffic today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const { api } = await import('@/lib/api');
      const response = await api.post('/ai/chat', { message: input });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.reply || "Sorry, I couldn't process that.",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error connecting to AI service.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sidebar History */}
      <div className={styles.sidebar}>
        <button className={styles.newChatBtn} onClick={() => setMessages([{ id: '1', role: 'assistant', content: 'Hello! I am your AI SEO Copilot.', timestamp: new Date() }])}>
          <MessageSquarePlus size={18} /> New Chat
        </button>

        <div className={styles.historySection}>
          <div className={styles.historyTitle}>Suggested Queries</div>
          <div className={styles.historyItem} onClick={() => setInput("Why did my traffic drop?")}>Why did my traffic drop?</div>
          <div className={styles.historyItem} onClick={() => setInput("What keywords should I target?")}>What keywords should I target?</div>
          <div className={styles.historyItem} onClick={() => setInput("Analyze my competitors")}>Analyze my competitors</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={styles.chatArea}>
        <div className={styles.messages}>
          <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRowUser : ''}`}
            >
              <div className={`${styles.avatar} ${msg.role === 'user' ? styles.avatarUser : styles.avatarAi}`}>
                {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
              </div>
              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          </AnimatePresence>

          {isTyping && (
             <div className={`${styles.messageRow}`}>
               <div className={`${styles.avatar} ${styles.avatarAi}`}><Sparkles size={18} /></div>
               <div className={`${styles.bubble} ${styles.bubbleAi}`} style={{ display: 'flex', gap: '4px', alignItems: 'center', minHeight: '44px' }}>
                 <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '6px', height: '6px', background: '#94A3B8', borderRadius: '50%' }} />
                 <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} style={{ width: '6px', height: '6px', background: '#94A3B8', borderRadius: '50%' }} />
                 <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} style={{ width: '6px', height: '6px', background: '#94A3B8', borderRadius: '50%' }} />
               </div>
             </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your SEO or analytics..." 
              className={styles.input}
            />
            <button 
              className={styles.sendBtn} 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{ opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
