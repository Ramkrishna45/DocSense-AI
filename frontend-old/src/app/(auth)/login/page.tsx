'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { BrainCircuit, AlertCircle, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Gradient border effect */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-cyan-500/20 via-transparent to-emerald-500/20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative rounded-2xl p-8 sm:p-10 bg-[#0a0f18]/90 backdrop-blur-2xl border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Logo area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 border border-white/[0.08] mb-5 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
          >
            <BrainCircuit className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm">Sign in to your knowledge base</p>
        </motion.div>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div custom={0} variants={formItemVariants} initial="hidden" animate="visible">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </motion.div>

          <motion.div custom={1} variants={formItemVariants} initial="hidden" animate="visible">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </motion.div>
          
          <motion.div custom={2} variants={formItemVariants} initial="hidden" animate="visible">
            <div className="relative group pt-1">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                loading={isLoading}
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </form>

        <motion.div
          custom={3}
          variants={formItemVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 text-center text-sm text-slate-400"
        >
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-cyan-400 hover:text-emerald-400 font-medium transition-colors">
            Create an account
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
