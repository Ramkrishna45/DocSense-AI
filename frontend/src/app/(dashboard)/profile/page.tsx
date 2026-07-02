"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, LogOut, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Your Profile</h1>
        <p className="text-zinc-400">Manage your account details and preferences.</p>
      </div>

      <Card className="glass-card bg-white/5 border-white/10 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 w-full" />
        <div className="px-8 pb-8 relative">
          <div className="absolute -top-16 left-8">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-background bg-secondary shadow-2xl">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Felix'}`}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="mt-20 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-zinc-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Free Plan
              </p>
            </div>

            <div className="grid gap-6 py-6 border-y border-white/10">
              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Email Address</p>
                <div className="flex items-center gap-3 text-zinc-200">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <span className="text-lg">{user.email}</span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Account ID</p>
                <div className="flex items-center gap-3 text-zinc-200">
                  <UserIcon className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-mono bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">{user.id}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="rounded-xl shadow-lg shadow-red-500/20"
              >
                <LogOut className="w-4 h-4 mr-2" /> Log out of DocSense
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
