"use client";

import React from 'react';
import { Bell, Search, Menu, LogOut, User as UserIcon, Settings } from 'lucide-react';
// Assume standard shadcn UI imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border/50 h-16 flex items-center px-4 md:px-6 justify-between">
      <div className="flex items-center flex-1">
        <button className="md:hidden mr-4 p-2 text-muted-foreground hover:text-foreground">
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex relative w-96 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-secondary/30 border-none rounded-full focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm transition-all"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
        </button>

        <DropdownMenu>
          {/* @ts-expect-error - asChild type mismatch with Radix */}
          <DropdownMenuTrigger asChild>
            <button className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-border hover:border-primary/50 transition-colors focus:outline-none">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`}
                alt="User Avatar"
                className="w-full h-full object-cover bg-secondary"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
            <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer flex items-center">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
