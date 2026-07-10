"use client";

import React from 'react';
import Link from 'next/link';
import { Bell, Search, Menu, LogOut, User as UserIcon, LayoutDashboard, FileText, MessageSquare, Search as SearchIcon, UploadCloud, Folder } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Collections', href: '/collections', icon: Folder },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Semantic Search', href: '/search', icon: SearchIcon },
  { name: 'Upload', href: '/upload', icon: UploadCloud },
];

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Close sheet when route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border/50 h-16 flex items-center px-4 md:px-6 justify-between">
      <div className="flex items-center flex-1">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden mr-4 p-2 text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-zinc-950 border-border/50 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="px-4 py-6 flex items-center justify-center border-b border-white/5">
              <img src="/trans-logo.svg" alt="DocSense Logo" className="w-48 h-auto object-contain" />
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto h-full">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        
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

        <Link href="/profile" className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-border hover:border-primary/50 transition-colors focus:outline-none cursor-pointer block">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`}
            alt="User Avatar"
            className="w-full h-full object-cover bg-secondary"
          />
        </Link>
      </div>
    </header>
  );
}
