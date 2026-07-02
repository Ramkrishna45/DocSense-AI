"use client";

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      router.push('/');
    } catch (error: any) {
      toast.error('Failed to login: ' + (error.message || 'Unknown error'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-8 shadow-2xl border border-white/10 dark:border-white/5 backdrop-blur-xl bg-white/50 dark:bg-black/50"
    >
      <div className="mb-2 text-center flex flex-col items-center">
        <div className="w-full h-36 flex items-center justify-center mb-4 relative">
          <img src="/trans-logo.svg" alt="DocSense Logo" className="w-[120%] max-w-[120%] h-auto object-contain scale-[2.5] absolute" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 mt-4 relative z-10">Welcome Back</h1>
        <p className="text-muted-foreground text-sm relative z-10">Enter your credentials to access your account</p>
      </div>

      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <motion.div variants={itemVariants} className="space-y-2">
          <label className="text-sm font-medium text-foreground ml-1" htmlFor="email">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
            <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </motion.div>
      </motion.form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline font-medium">Register</Link></p>
      </div>
    </motion.div>
  );
}
