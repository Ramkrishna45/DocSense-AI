"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, Search as SearchIcon, UploadCloud, ChevronRight, Folder } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists from shadcn

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Collections', href: '/collections', icon: Folder },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Semantic Search', href: '/search', icon: SearchIcon },
  { name: 'Upload', href: '/upload', icon: UploadCloud },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 hidden md:flex flex-col h-full border-r border-border/50 glass">
      <div className="p-6 flex items-center justify-center h-24">
        <img src="/trans-logo.svg" alt="DocSense Logo" className="h-full w-auto object-contain" />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
